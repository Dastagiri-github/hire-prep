const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();

app.use(cors());
app.use(express.json());

// Extremely fast endpoint for Google Cloud Scheduler (CRON) to hit every 10 mins to keep container warm
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

const TIMEOUT_MS = 5000;

app.post('/execute', async (req, res) => {
    const { language, code } = req.body;

    if (!language || !code) {
        return res.status(400).json({ error: 'Language and code are required.' });
    }

    const uuid = uuidv4();
    const execDir = path.join(os.tmpdir(), `execution-${uuid}`);

    try {
        // 1. Create isolated directory for this specific request
        if (!fs.existsSync(execDir)) {
            fs.mkdirSync(execDir, { recursive: true });
        }

        let fileName = '';
        let compileCmd = null;
        let runCmd = '';

        // 2. Configure language specifics
        switch (language.toLowerCase()) {
            case 'python':
                fileName = 'solution.py';
                runCmd = `python3 ${fileName}`;
                break;
            case 'cpp':
            case 'c++':
                fileName = 'solution.cpp';
                compileCmd = `g++ -O2 -o solution ${fileName}`;
                runCmd = `./solution`;
                break;
            case 'java':
                fileName = 'Solution.java';
                compileCmd = `javac ${fileName}`;
                runCmd = `java Solution`;
                break;
            case 'javascript':
            case 'js':
            case 'node':
                fileName = 'solution.js';
                runCmd = `node ${fileName}`;
                break;
            default:
                throw new Error('Unsupported language');
        }

        const filePath = path.join(execDir, fileName);
        fs.writeFileSync(filePath, code);

        // 3. Execution logic wrapped in a Promise
        const executeCode = () => {
             return new Promise((resolve) => {
                 const runProcess = () => {
                     exec(runCmd, { cwd: execDir, timeout: TIMEOUT_MS }, (error, stdout, stderr) => {
                         if (error) {
                             if (error.killed) {
                                  return resolve({ error: 'Time Limit Exceeded', stderr: '' });
                             }
                             return resolve({ error: error.message, stderr: stderr });
                         }
                         resolve({ output: stdout, stderr: stderr });
                     });
                 };

                 if (compileCmd) {
                     // Adding timeout for compile to prevent infinite compile time exploits (rare but possible in C++)
                     exec(compileCmd, { cwd: execDir, timeout: 5000 }, (compileError, compileStdout, compileStderr) => {
                         if (compileError) {
                             return resolve({ error: 'Compilation Error', stderr: compileStderr || compileError.message });
                         }
                         runProcess();
                     });
                 } else {
                     runProcess();
                 }
             });
        };

        const result = await executeCode();

        if (result.error && result.error === 'Time Limit Exceeded') {
             return res.status(400).json({ error: 'Time Limit Exceeded' });
        } else if (result.error && result.error === 'Compilation Error') {
             return res.status(400).json({ error: 'Compilation Error', stderr: result.stderr });
        } else if (result.error) {
             return res.status(400).json({ error: 'Runtime Error', stderr: result.stderr || result.error });
        }

        res.status(200).json({ output: result.output, stderr: result.stderr });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        // 4. Forcefully clean up directory to prevent leakage
        try {
            if (fs.existsSync(execDir)) {
                fs.rmSync(execDir, { recursive: true, force: true });
            }
        } catch (cleanupErr) {
            console.error('Error cleaning up directory:', cleanupErr);
        }
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Execution Engine running on port ${PORT}`);
});
