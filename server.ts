
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { spawn } from 'child_process';
import path from 'path';

async function startServer() {
    const app = express();
    const PORT = 3000;

    // --- Start Python Backend ---
    const serverPyPath = path.join(process.cwd(), 'server.py');
    if (require('fs').existsSync(serverPyPath)) {
        console.log(">> STARTING ARCHANGEL KERNEL (PYTHON)...");
        const pythonProcess = spawn('python3', ['server.py'], {
            stdio: 'inherit'
        });

        pythonProcess.on('error', (err) => {
            console.error('Failed to start Python process:', err);
        });
    } else {
        console.warn(">> ARCHANGEL KERNEL (server.py) NOT FOUND. PROXY MAY FAIL.");
    }

    // --- Proxy Kernel Requests to Python (Port 8000) ---
    app.use('/kernel', createProxyMiddleware({
        target: 'http://localhost:8000',
        changeOrigin: true,
        pathRewrite: {
            '^/kernel': '', // remove /kernel prefix when sending to python
        },
    }));

    // --- Vite Middleware ---
    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        app.use(express.static(path.join(process.cwd(), 'dist')));
        app.get('*', (req, res) => {
            res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
        });
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`>> ARCHANGEL OMEGA ONLINE: http://localhost:${PORT}`);
    });
}

startServer();
