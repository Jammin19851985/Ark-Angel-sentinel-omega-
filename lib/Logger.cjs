const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logFile = path.resolve(__dirname, '../logs/trading.log');
        
        // Ensure logs directory exists
        const dir = path.dirname(this.logFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    log(level, moduleName, message) {
        const timestamp = new Date().toISOString();
        const formatted = `[${timestamp}] [${level}] [${moduleName}] ${message}`;
        console.log(formatted);
        fs.appendFileSync(this.logFile, formatted + '\n');
    }

    info(moduleName, msg) { this.log('INFO', moduleName, msg); }
    warn(moduleName, msg) { this.log('WARN', moduleName, msg); }
    error(moduleName, msg) { this.log('ERROR', moduleName, msg); }
    trade(msg) { this.log('TRADE', 'EXECUTION', msg); }
}

module.exports = new Logger();
