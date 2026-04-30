
import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

async function startServer() {
    const app = express();
    const PORT = 3000;
    const server = createServer(app);

    app.use(cors());

    let isSpineBooting = true;

    // 2. Proxy API requests to Python Spine (MOVED UP)
    app.use('/spine-bridge', (req, res, next) => {
        if (isSpineBooting) {
            return res.status(503).json({
                error: "EXECUTION_SPINE_BOOTING",
                message: "Archangel Spine is currently initializing dependencies. Please standby.",
                timestamp: new Date().toISOString()
            });
        }
        next();
    }, createProxyMiddleware({
        target: 'http://localhost:8888',
        changeOrigin: true,
        pathRewrite: {
            '^/spine-bridge': '', 
        },
        on: {
            proxyReq: (proxyReq, req, res) => {
                console.log(`>> PROXY_REQUEST: ${req.method} ${req.url} -> http://localhost:8888${req.url.replace('/spine-bridge', '')}`);
                proxyReq.setHeader('Authorization', 'Bearer ARCHANGEL_INTERNAL_TOKEN');
            },
            proxyRes: (proxyRes, req, res) => {
                console.log(`<< PROXY_RESPONSE: ${proxyRes.statusCode} from ${req.url}`);
            },
            error: (err, req, res) => {
                console.error(">> PROXY_ERROR:", err.message);
                const response = res as any;
                if (response && typeof response.status === 'function' && !response.headersSent) {
                    try {
                        response.status(503).json({ 
                            error: "EXECUTION_SPINE_OFFLINE", 
                            details: err.message,
                            timestamp: new Date().toISOString()
                        });
                    } catch (e) {
                        console.error(">> FAILED_TO_SEND_PROXY_ERROR_JSON:", e);
                    }
                }
            }
        }
    }));

    // WebSocket Server for Frontend
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        console.log(">> WS_FRONTEND_CLIENT_CONNECTED");
        
        // Connect to Python Spine WebSocket
        const spineWs = new WebSocket('ws://localhost:8888/ws', {
            headers: {
                'Authorization': 'Bearer ARCHANGEL_INTERNAL_TOKEN'
            }
        });
        
        spineWs.on('open', () => {
            console.log(">> WS_SPINE_BRIDGE_OPENED");
        });

        spineWs.on('message', (data) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(data.toString());
            }
        });

        spineWs.on('error', (err) => {
            console.error(">> WS_SPINE_BRIDGE_ERROR:", err.message);
        });

        spineWs.on('close', () => {
            console.log(">> WS_SPINE_BRIDGE_CLOSED");
            ws.close();
        });

        ws.on('close', () => {
            console.log(">> WS_FRONTEND_CLIENT_DISCONNECTED");
            spineWs.close();
        });
    });

    // Global Request Logger
    app.use((req, res, next) => {
        const now = new Date().toISOString();
        const start = Date.now();
        
        res.on('finish', () => {
            const duration = Date.now() - start;
            const size = res.get('Content-Length') || '0';
            const type = res.get('Content-Type') || 'unknown';
            const user = req.headers['x-goog-authenticated-user-email'] || 'ANON';
            const referer = req.headers.referer || 'N/A';
            const accept = req.headers.accept || '*/*';
            const requestedWith = req.headers['x-requested-with'] || 'N/A';
            console.log(`[${now}] [NODE_SERVER] ${req.method} ${req.url} -> ${res.statusCode} (${size} bytes, ${type}, ${duration}ms, User: ${user}, Ref: ${referer}, Accept: ${accept}, XRW: ${requestedWith})`);
        });

        if (req.headers.authorization) {
            console.log(`[NODE_SERVER] AUTH_HEADER_DETECTED: ${req.headers.authorization.substring(0, 15)}...`);
        }
        if (req.headers.cookie) {
            console.log(`[NODE_SERVER] COOKIES_DETECTED: ${req.headers.cookie.substring(0, 15)}...`);
        }
        next();
    });

    console.log(">> INITIATING ARCHANGEL OMEGA MULTI-KERNEL BOOT...");
    let pythonSpine: any;

    const DEPS_PATH = path.join(process.cwd(), '.python_deps');
    const spineEnv: any = {
        ...process.env,
        PYTHONUNBUFFERED: '1',
        PYTHONPATH: process.env.PYTHONPATH ? `${DEPS_PATH}:${process.env.PYTHONPATH}:.` : `${DEPS_PATH}:.`,
        PYTHONUSERBASE: path.join(process.cwd(), '.python_user_base'),
        PIP_CACHE_DIR: path.join(process.cwd(), '.pip_cache')
    };

    // Ensure directories exist
    try {
        [DEPS_PATH, spineEnv.PYTHONUSERBASE, spineEnv.PIP_CACHE_DIR].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`>> [BOOT] CREATED ${dir}`);
            }
        });
        // Add bin to PATH
        spineEnv.PATH = `${path.join(spineEnv.PYTHONUSERBASE, 'bin')}:${spineEnv.PATH || ''}`;
    } catch (e) {
        console.warn(">> [BOOT] Failed to setup directories:", e);
    }

    // 1. Start Python Execution Spine (Port 8888)
    const tryPip = (cmd: string, args: string[]): Promise<boolean> => {
        return new Promise((resolve) => {
            console.log(`>> EXECUTING: ${cmd} ${args.join(' ')}`);
            try {
                const proc = spawn(cmd, args, { env: spineEnv });
                
                proc.on('error', (err) => {
                    console.error(`>> FAILED TO SPAWN ${cmd}:`, err.message);
                    resolve(false);
                });

                proc.stdout.on('data', (data) => {
                    console.log(`>> [${cmd} STDOUT]: ${data.toString().trim()}`);
                });
                
                proc.stderr.on('data', (data) => {
                    console.error(`>> [${cmd} STDERR]: ${data.toString().trim()}`);
                });

                proc.on('close', (code) => {
                    console.log(`>> ${cmd} exited with code ${code}`);
                    resolve(code === 0);
                });
            } catch (err: any) {
                console.error(`>> EXCEPTION SPAWNING ${cmd}:`, err.message);
                resolve(false);
            }
        });
    };

    const installDeps = async () => {
        console.log(">> [BOOT] INITIATING PYTHON DEPENDENCY INJECTION...");
        
        const tryInstall = async (pythonCmd: string) => {
            console.log(`>> [BOOT] ATTEMPTING INSTALL VIA: ${pythonCmd}`);
            try {
                // 1. Try to upgrade pip first
                await tryPip(pythonCmd, ['-m', 'pip', 'install', '--upgrade', 'pip']).catch(() => {});
                
                // 2. Install core packages into DEPS_PATH
                // We include pydantic-core and typing-extensions for stability
                const corePackages = ['fastapi', 'uvicorn[standard]', 'pydantic', 'pydantic-settings', 'requests', 'aiohttp', 'ib-insync', 'python-dotenv', 'pydantic-core', 'typing-extensions'];
                console.log(`>> INSTALLING CORE PACKAGES TO ${DEPS_PATH}...`);
                
                // Try installing all at once for speed
                let allSuccess = await tryPip(pythonCmd, ['-m', 'pip', 'install', '--target', DEPS_PATH, '--prefer-binary', '--no-cache-dir', ...corePackages]);
                
                if (!allSuccess) {
                    console.warn(">> PIP: Bulk install failed. Falling back to individual installs...");
                    for (const pkg of corePackages) {
                        console.log(`>> PIP: Installing ${pkg}...`);
                        let pkgSuccess = await tryPip(pythonCmd, ['-m', 'pip', 'install', '--target', DEPS_PATH, '--prefer-binary', '--no-cache-dir', pkg]);
                        
                        if (!pkgSuccess) {
                            console.warn(`>> PIP: Failed to install ${pkg} to ${DEPS_PATH}. Trying --user...`);
                            await tryPip(pythonCmd, ['-m', 'pip', 'install', '--user', '--break-system-packages', '--prefer-binary', pkg, '--no-cache-dir']).catch(() => {});
                        }
                    }
                }

                // 3. Install requirements.txt if it exists
                if (fs.existsSync('requirements.txt')) {
                    console.log(">> INSTALLING requirements.txt...");
                    let reqSuccess = await tryPip(pythonCmd, ['-m', 'pip', 'install', '--target', DEPS_PATH, '-r', 'requirements.txt', '--prefer-binary', '--no-cache-dir']);
                    if (!reqSuccess) {
                        console.warn(">> PIP: requirements.txt failed to target. Trying --user...");
                        await tryPip(pythonCmd, ['-m', 'pip', 'install', '--user', '--break-system-packages', '-r', 'requirements.txt', '--prefer-binary', '--no-cache-dir']).catch(() => {});
                    }
                }

                // 4. Final Verification
                console.log(">> VERIFYING INSTALLATION...");
                const verified = await tryPip(pythonCmd, ['-c', 'import fastapi; import uvicorn; import pydantic; import ib_insync; print("VERIFICATION_SUCCESS")']);
                
                if (verified) {
                    console.log(">> [BOOT] DEPENDENCY_VERIFICATION_PASSED");
                } else {
                    console.error(">> [BOOT] DEPENDENCY_VERIFICATION_FAILED - Spine may fail to start.");
                    // Log directory contents for debugging
                    try {
                        const files = fs.readdirSync(DEPS_PATH);
                        console.log(`>> [BOOT] DEPS_PATH contents: ${files.join(', ')}`);
                    } catch (e) {
                        console.error(">> [BOOT] Could not read DEPS_PATH");
                    }
                }
                
                return verified;
            } catch (err) {
                console.error(">> [BOOT] INSTALLATION_ERROR:", err);
                return false;
            }
        };

        // Try python3 first
        let success = false;
        const hasPython3 = await tryPip('python3', ['--version']);
        if (hasPython3) {
            success = await tryInstall('python3');
        }
        
        // Try python fallback
        if (!success) {
            const hasPython = await tryPip('python', ['--version']);
            if (hasPython) {
                success = await tryInstall('python');
            }
        }

        return success;
    };

    const startSpine = async () => {
        console.log(">> STARTING PYTHON EXECUTION SPINE...");
        
        const trySpawn = (cmd: string, args: string[]) => {
            return new Promise((resolve) => {
                console.log(`>> SPAWNING: ${cmd} ${args.join(' ')}`);
                const proc = spawn(cmd, args, { env: spineEnv });
                proc.on('error', (err) => {
                    console.error(`>> FAILED TO SPAWN ${cmd}:`, err.message);
                    resolve(null);
                });
                proc.on('spawn', () => resolve(proc));
            });
        };

        let proc = await trySpawn('python3', ['server.py']);
        if (!proc) {
            console.warn(">> python3 failed, trying python...");
            proc = await trySpawn('python', ['server.py']);
        }

        if (proc) {
            pythonSpine = proc;
            setupSpineHandlers(pythonSpine);
        } else {
            console.error(">> FAILED TO START PYTHON SPINE WITH BOTH python3 AND python.");
        }
    };

    installDeps().then(async (success) => {
        if (success) {
            console.log(">> PYTHON DEPENDENCIES INSTALLED SUCCESSFULLY.");
        } else {
            console.error(">> ALL PIP INSTALL ATTEMPTS FAILED. Attempting to start spine anyway...");
        }
        await startSpine();
        // Give it a moment to actually start listening
        setTimeout(() => {
            isSpineBooting = false;
            console.log(">> ARCHANGEL OMEGA SPINE UPLINK READY.");
        }, 2000);
    });

    const setupSpineHandlers = (proc: any) => {
        proc.on('spawn', () => {
            console.log(">> PYTHON_SPINE SPAWNED SUCCESSFULLY.");
        });

        proc.on('error', (err: any) => {
            console.error(">> PYTHON_SPINE_SPAWN_ERROR:", err.message);
        });

        proc.stdout.on('data', (data: any) => {
            console.log(`[PYTHON_SPINE] ${data}`);
        });

        proc.stderr.on('data', (data: any) => {
            console.error(`[PYTHON_SPINE_ERR] ${data}`);
        });

        proc.on('exit', (code: number) => {
            console.error(`[PYTHON_SPINE] Process exited with code ${code}`);
            if (code !== 0 && !proc.killed) {
                console.log(">> RESTARTING PYTHON_SPINE IN 5S...");
                setTimeout(startSpine, 5000);
            }
        });
    };

    app.get('/spine-bridge/spine-status', (req, res) => {
        res.json({
            alive: pythonSpine && !pythonSpine.killed && pythonSpine.exitCode === null,
            exitCode: pythonSpine ? pythonSpine.exitCode : null,
            pid: pythonSpine ? pythonSpine.pid : null
        });
    });

    app.get('/spine-bridge/direct-status', async (req, res) => {
        try {
            const response = await fetch('http://localhost:8888/status');
            const data = await response.json();
            res.json(data);
        } catch (err: any) {
            res.status(500).json({ error: "DIRECT_FETCH_FAILED", details: err.message });
        }
    });

    app.get('/spine-bridge/direct-health', async (req, res) => {
        try {
            const response = await fetch('http://localhost:8888/health');
            const data = await response.json();
            res.json(data);
        } catch (err: any) {
            res.status(500).json({ error: "DIRECT_HEALTH_FAILED", details: err.message });
        }
    });

    // 3. Vite Middleware for Frontend
    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
    });
    app.use(vite.middlewares);

    // 404 Logger
    app.use((req, res) => {
        console.warn(`[NODE_SERVER] 404 NOT_FOUND: ${req.method} ${req.url}`);
        res.status(404).send("Not Found");
    });

    server.listen(PORT, '0.0.0.0', () => {
        console.log(`>> ARCHANGEL OMEGA OPERATIONAL ON http://localhost:${PORT}`);
    });

    // Cleanup on exit
    process.on('SIGINT', () => {
        pythonSpine.kill();
        process.exit();
    });
}

startServer();
