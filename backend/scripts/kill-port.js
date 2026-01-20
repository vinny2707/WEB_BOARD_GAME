const { exec } = require('child_process');

const PORT = 3000;

console.log(`Checking for processes on port ${PORT}...`);

if (process.platform === 'win32') {
    exec(`netstat -ano | findstr :${PORT}`, (err, stdout) => {
        if (err || !stdout) {
            console.log(`Port ${PORT} is free.`);
            return;
        }

        const lines = stdout.trim().split('\n');
        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];

            if (pid && !isNaN(pid) && pid !== '0') {
                exec(`taskkill /PID ${pid} /F`, (killErr) => {
                    if (killErr) {
                        console.error(`Failed to kill PID ${pid}:`, killErr.message);
                    } else {
                        console.log(`✅ Killed process ${pid} on port ${PORT}`);
                    }
                });
            }
        });
    });
} else {
    // Linux/Mac
    exec(`lsof -i :${PORT} -t | xargs kill -9`, (err) => {
        if (!err) console.log(`✅ Cleared port ${PORT}`);
    });
}
