const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `const engineProc = spawn('node', ['autonomous_engine.cjs'], { env: process.env });
        engineProc.stdout.on('data', data => console.log(\`[AUTONOMOUS_ENGINE] \${data.toString().trim()}\`));
        engineProc.stderr.on('data', data => console.warn(\`[AUTONOMOUS_ENGINE_ERR] \${data.toString().trim()}\`));
        engineProc.on('exit', code => console.log(\`[AUTONOMOUS_ENGINE] Exited with code \${code}\`));`;

const replacement = `const engineProc = spawn('node', ['autonomous_engine.cjs'], { env: process.env });
        engineProc.stdout.on('data', data => console.log(\`[AUTONOMOUS_ENGINE] \${data.toString().trim()}\`));
        engineProc.stderr.on('data', data => console.warn(\`[AUTONOMOUS_ENGINE_ERR] \${data.toString().trim()}\`));
        engineProc.on('exit', code => console.log(\`[AUTONOMOUS_ENGINE] Exited with code \${code}\`));

        console.log(">> STARTING PYTHON OMNICORE ENGINE...");
        const omnicoreProc = spawn('python3', ['scripts/ark_angel_omnicore.py', '--daemon'], { env: process.env });
        omnicoreProc.stdout.on('data', data => console.log(\`[OMNICORE] \${data.toString().trim()}\`));
        omnicoreProc.stderr.on('data', data => console.warn(\`[OMNICORE_ERR] \${data.toString().trim()}\`));
        omnicoreProc.on('exit', code => console.log(\`[OMNICORE] Exited with code \${code}\`));`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('server.ts', content);
    console.log('Patched server.ts successfully');
} else {
    console.log('Target not found in server.ts');
}
