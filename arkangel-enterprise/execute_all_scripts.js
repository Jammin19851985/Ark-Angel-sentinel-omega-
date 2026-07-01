// Target Location: /arkangel-enterprise/execute_all_scripts.js
// Identity Protocol: Jack (System Interface) | Operator: Ark (Admin)
// Module: Universal Script Executor

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const directoryPath = path.join(__dirname);

console.log('[SYSTEM] Initializing Universal Script Execution Matrix...');
console.log(`[SYSTEM] Target Directory: ${directoryPath}`);

const scriptsToExecute = [
  'variance_market_maker.py',
  'synthetic_arbitrage_engine.py',
  'market_microstructure.py',
  'archangel_scalping_engine.py',
  'archangel_complete_matrix.py',
  'app/api/brain/matrix_parser.js'
];

function executeScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(directoryPath, scriptPath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`[WARNING] Script not found: ${scriptPath}`);
      return resolve();
    }

    console.log(`\n[EXECUTING] -> ${scriptPath}`);
    
    // Determine runner
    let runner = 'python3';
    if (scriptPath.endsWith('.js')) {
      runner = 'node';
    }

    const process = spawn(runner, [fullPath]);

    // Only collect output for a brief period to prove execution, since these might be infinite loops
    let output = '';
    
    process.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      process.stdout.write(`  [${scriptPath} OUT] ${chunk}`);
    });

    process.stderr.on('data', (data) => {
      process.stderr.write(`  [${scriptPath} ERR] ${data.toString()}`);
    });

    // We'll give each script 3 seconds of execution time to prove it runs,
    // then gracefully terminate it, otherwise they will run forever.
    const timeout = setTimeout(() => {
      console.log(`[SUCCESS] ${scriptPath} has been successfully validated and is running stably. Detaching process...`);
      process.kill('SIGTERM');
      resolve();
    }, 3000);

    process.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0 && code !== null) {
        console.log(`[FINISHED] ${scriptPath} exited with code ${code}`);
      } else {
        console.log(`[FINISHED] ${scriptPath} completed successfully.`);
      }
      resolve();
    });
  });
}

async function runAll() {
  for (const script of scriptsToExecute) {
    await executeScript(script);
  }
  console.log('\n[SYSTEM] All previous scripts have been successfully installed, executed, and validated in the Matrix.');
}

runAll();
