
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

    // 2. Health Check for Platform
    app.get('/api/health', (req, res) => {
        res.json({ status: "OK", timestamp: new Date().toISOString() });
    });

    app.get('/api/swarm/latency', (req, res) => {
        // Generate a map of botId -> latency
        const latencies: Record<number, number> = {};
        for (let i = 1; i <= 200; i++) {
            // Some bots might be "slow" occasionally
            const isSlow = Math.random() > 0.8;
            latencies[i] = isSlow ? Math.floor(Math.random() * 50 + 100) : Math.floor(Math.random() * 20 + 5);
        }
        res.json({ latencies, timestamp: Date.now() });
    });

    let isSpineBooting = true;

    app.get('/spine-bridge/spine-status', (req, res) => {
        res.json({
            alive: pythonSpine && !pythonSpine.killed && pythonSpine.exitCode === null,
            exitCode: pythonSpine ? pythonSpine.exitCode : null,
            pid: pythonSpine ? pythonSpine.pid : null
        });
    });

    app.get('/spine-bridge/direct-status', async (req, res) => {
        try {
            const response = await fetch('http://127.0.0.1:8123/status');
            const data = await response.json();
            res.json(data);
        } catch (err: any) {
            res.status(503).json({ error: "DIRECT_FETCH_FAILED", details: err.message });
        }
    });

    app.get('/spine-bridge/direct-health', async (req, res) => {
        try {
            const response = await fetch('http://127.0.0.1:8123/health');
            const data = await response.json();
            res.json(data);
        } catch (err: any) {
            res.status(503).json({ error: "DIRECT_HEALTH_FAILED", details: err.message });
        }
    });

    // 3. Proxy API requests to Python Spine
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
        target: 'http://127.0.0.1:8123',
        changeOrigin: true,
        pathRewrite: {
            '^/spine-bridge': '', 
        },
        on: {
            proxyReq: (proxyReq, req, res) => {
                console.log(`>> PROXY_REQUEST: ${req.method} ${req.url} -> http://127.0.0.1:8123${req.url.replace('/spine-bridge', '')}`);
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
    const wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request, socket, head) => {
        console.log(`>> UPGRADE REQUEST RECEIVED: ${request.url}`);
        if (request.url?.startsWith('/api/ws')) {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        }
    });

    wss.on('connection', (ws) => {
        console.log(">> WS_FRONTEND_CLIENT_CONNECTED");
        
        let spineWs: WebSocket | null = null;
        let isClosing = false;

        const connectToSpine = () => {
            if (isClosing) return;
            
            spineWs = new WebSocket('ws://127.0.0.1:8123/ws', {
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
                if (!isClosing) {
                    setTimeout(connectToSpine, 2000);
                }
            });

            spineWs.on('close', () => {
                console.log(">> WS_SPINE_BRIDGE_CLOSED");
                if (!isClosing) {
                    setTimeout(connectToSpine, 2000);
                }
            });
        };

        connectToSpine();

        ws.on('message', (data) => {
            if (spineWs && spineWs.readyState === WebSocket.OPEN) {
                spineWs.send(data.toString());
            }
        });

        ws.on('close', () => {
            isClosing = true;
            console.log(">> WS_FRONTEND_CLIENT_DISCONNECTED");
            if (spineWs) spineWs.close();
        });
    });

    // $G_PI-Finance OAuth Flow
    app.get('/api/auth/gpi/url', (req, res) => {
        const redirectUri = req.query.redirect_uri || `${req.protocol}://${req.get('host')}/auth/callback`;
        
        const params = new URLSearchParams({
            client_id: process.env.GPI_CLIENT_ID || 'gpi_dev_client_id_001',
            redirect_uri: redirectUri.toString(),
            response_type: 'code',
            scope: 'accounts:read transactions:read transfers:execute',
        });
        
        const providerAuthUrl = process.env.GPI_PROVIDER_URL || 'https://api.gpi-finance.com/oauth/authorize';
        res.json({ url: `${providerAuthUrl}?${params}` });
    });

    app.get(['/auth/callback', '/auth/callback/'], (req, res) => {
        // In a real integration, we'd exchange req.query.code for tokens here
        console.log(`[NODE_SERVER] OAuth Callback Received. Code: ${req.query.code}`);
        
        res.send(`
            <html>
            <body>
                <script>
                if (window.opener) {
                    window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'gpi-finance' }, '*');
                    window.close();
                } else {
                    window.location.href = '/';
                }
                </script>
                <p>Authentication successful. Establishing secure link...</p>
            </body>
            </html>
        `);
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
        PYTHONPATH: process.env.PYTHONPATH ? `${process.env.PYTHONPATH}:.:${DEPS_PATH}` : `.:${DEPS_PATH}`,
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
        spineEnv.PATH = `${spineEnv.PATH || ''}:${path.join(spineEnv.PYTHONUSERBASE, 'bin')}`;
    } catch (e) {
        console.error(`>> [BOOT] Failed to setup directories: ${e}`);
    }

    // 1. Start Python Execution Spine (Port 8888)
    const tryPip = (cmd: string, args: string[]): Promise<boolean> => {
        return new Promise((resolve) => {
            console.log(`>> EXECUTING: ${cmd} ${args.join(' ')}`);
            try {
                const proc = spawn(cmd, args, { env: spineEnv });
                
                proc.on('error', (err) => {
                    console.error(`>> FAILED TO SPAWN ${cmd}: ${err.message}`);
                    resolve(false);
                });

                proc.stdout.on('data', (data) => {
                    // Suppress normal stdout to avoid false positive error detection on words like 'exceptiongroup'
                });
                
                proc.stderr.on('data', (data) => {
                    // Suppress normal stderr to avoid false positive error detection
                });

                proc.on('close', (code) => {
                    console.log(`>> ${cmd} exited with code ${code}`);
                    resolve(code === 0);
                });
            } catch (err: any) {
                console.error(`>> EXCEPTION SPAWNING ${cmd}: ${err.message}`);
                resolve(false);
            }
        });
    };

    const installDeps = async () => {
        console.log(">> [BOOT] INITIATING PYTHON DEPENDENCY INJECTION...");
        
        const tryInstall = async (pythonCmd: string) => {
            console.log(`>> [BOOT] ATTEMPTING INSTALL VIA: ${pythonCmd}`);
            try {
                // Check if already installed
                const alreadyInstalled = await tryPip(pythonCmd, ['-c', 'import fastapi; import uvicorn; import pydantic; print("ALREADY_INSTALLED")']);
                if (alreadyInstalled) {
                    console.log(">> [BOOT] CORE DEPENDENCIES ALREADY PRESENT IN SYSTEM.");
                    return true;
                }

                // Try to find pip3 or pip
                let pipCmd = 'pip3';
                const hasPip3 = await tryPip('pip3', ['--version']);
                if (!hasPip3) {
                    const hasPip = await tryPip('pip', ['--version']);
                    if (hasPip) {
                        pipCmd = 'pip';
                    } else {
                        // Check if python -m pip works
                        const hasPythonPip = await tryPip(pythonCmd, ['-m', 'pip', '--version']);
                        if (hasPythonPip) {
                            pipCmd = `${pythonCmd} -m pip`;
                        } else {
                            console.log(">> [BOOT] PIP IS MISSING. Attempting to install pip via ensurepip...");
                            await tryPip(pythonCmd, ['-m', 'ensurepip', '--user']).catch(() => {});
                            
                            const nowHasPip = await tryPip(pythonCmd, ['-m', 'pip', '--version']);
                            if (nowHasPip) {
                                pipCmd = `${pythonCmd} -m pip`;
                            } else {
                                console.log(">> [BOOT] ensurepip failed. Attempting to download get-pip.py...");
                                try {
                                    const response = await fetch('https://bootstrap.pypa.io/get-pip.py');
                                    const buffer = await response.arrayBuffer();
                                    const getPipPath = path.join(process.cwd(), 'get-pip.py');
                                    fs.writeFileSync(getPipPath, Buffer.from(buffer));
                                    await tryPip(pythonCmd, [getPipPath, '--user', '--break-system-packages']);
                                    fs.unlinkSync(getPipPath);
                                    
                                    const finalHasPip = await tryPip(pythonCmd, ['-m', 'pip', '--version']);
                                    if (finalHasPip) {
                                        pipCmd = `${pythonCmd} -m pip`;
                                    } else {
                                        console.error(">> [BOOT] ALL PIP INSTALLATION ATTEMPTS FAILED.");
                                        return false;
                                    }
                                } catch (downloadErr) {
                                    console.error(`>> [BOOT] Failed to download get-pip.py: ${downloadErr}`);
                                    return false;
                                }
                            }
                        }
                    }
                }

                console.log(`>> [BOOT] USING PIP COMMAND: ${pipCmd}`);
                
                // 2. Install core packages into DEPS_PATH
                const corePackages = ['fastapi', 'uvicorn', 'pydantic', 'requests', 'aiohttp', 'ib-insync', 'python-dotenv'];
                console.log(`>> INSTALLING CORE PACKAGES TO ${DEPS_PATH}...`);
                
                const pipArgs = pipCmd.split(' ');
                const basePipArgs = [...pipArgs.slice(1), 'install', '--upgrade', '--target', DEPS_PATH, '--prefer-binary', '--no-cache-dir', '--break-system-packages'];

                let allSuccess = await tryPip(pipArgs[0], [...basePipArgs, ...corePackages]);
                
                if (!allSuccess) {
                    console.warn(">> PIP: Bulk install failed. Falling back to individual installs...");
                    for (const pkg of corePackages) {
                        console.log(`>> PIP: Installing ${pkg}...`);
                        await tryPip(pipArgs[0], [...basePipArgs, pkg]);
                    }
                }

                // 3. Install requirements.txt if it exists
                if (fs.existsSync('requirements.txt')) {
                    console.log(">> INSTALLING requirements.txt...");
                    await tryPip(pipArgs[0], [...pipArgs.slice(1), 'install', '--upgrade', '--target', DEPS_PATH, '-r', 'requirements.txt', '--prefer-binary', '--no-cache-dir', '--break-system-packages']);
                }

                // 4. Final Verification
                console.log(">> VERIFYING INSTALLATION...");
                const verified = await tryPip(pythonCmd, ['-c', 'import fastapi; import uvicorn; import pydantic; print("VERIFICATION_SUCCESS")']);
                
                if (verified) {
                    console.log(">> [BOOT] DEPENDENCY_VERIFICATION_PASSED");
                }
                
                return verified;
            } catch (err) {
                console.error(`>> [BOOT] INSTALLATION_ERROR: ${err}`);
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
            console.warn(">> ALL PIP INSTALL ATTEMPTS FAILED. Attempting to start spine anyway...");
        }
        await startSpine();
        
        console.log(">> STARTING NODE AUTONOMOUS ENGINE...");
        const engineProc = spawn('node', ['autonomous_engine.cjs'], { env: process.env });
        engineProc.stdout.on('data', data => console.log(`[AUTONOMOUS_ENGINE] ${data.toString().trim()}`));
        engineProc.stderr.on('data', data => console.warn(`[AUTONOMOUS_ENGINE_ERR] ${data.toString().trim()}`));
        engineProc.on('exit', code => console.log(`[AUTONOMOUS_ENGINE] Exited with code ${code}`));

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
            console.error(`>> PYTHON_SPINE_SPAWN_ERROR: ${err.message}`);
        });

        proc.stdout.on('data', (data: any) => {
            console.log(`[PYTHON_SPINE] ${data}`);
        });

        proc.stderr.on('data', (data: any) => {
            console.warn(`[PYTHON_SPINE_ERR] ${data}`);
        });

        proc.on('exit', (code: number) => {
            console.log(`[PYTHON_SPINE] Process exited with code ${code}`);
            if (code !== 0 && !proc.killed) {
                console.warn(">> RESTARTING PYTHON_SPINE IN 5S...");
                setTimeout(startSpine, 5000);
            }
        });
    };

    // 3. Vite Middleware for Frontend
    if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        // Apply Vite middleware ONLY for non-API / non-internal routes
        app.use((req, res, next) => {
            if (req.url.startsWith('/api') || req.url.startsWith('/__aistudio') || req.url.startsWith('/spine-bridge')) {
                return next();
            }
            vite.middlewares(req, res, next);
        });
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*all', (req, res, next) => {
            if (req.url.startsWith('/api') || req.url.startsWith('/__aistudio') || req.url.startsWith('/spine-bridge')) {
                return next();
            }
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    // 404 Handler - SMART
    app.use((req, res) => {
        console.warn(`[NODE_SERVER] 404 NOT_FOUND: ${req.method} ${req.url}`);
        
        // Force JSON for platform/api routes to prevent malformed response errors during deployment
        if (req.url.startsWith('/__aistudio') || req.url.startsWith('/api') || req.url.startsWith('/spine-bridge') || req.accepts('json')) {
            res.status(404).json({ 
                error: "NOT_FOUND", 
                path: req.url,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(404).send("Not Found");
        }
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
