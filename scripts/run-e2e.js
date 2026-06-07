import { spawn } from 'node:child_process';
import { createServer } from 'vite';

const host = '127.0.0.1';
const port = 4173;

const server = await createServer({
    logLevel: 'warn',
    server: {
        host,
        port,
        strictPort: true
    }
});

const runPlaywright = () =>
    new Promise((resolve) => {
        const child = spawn(
            process.execPath,
            ['node_modules/@playwright/test/cli.js', 'test', ...process.argv.slice(2)],
            {
                env: {
                    ...process.env,
                    PLAYWRIGHT_EXTERNAL_SERVER: '1'
                },
                stdio: 'inherit'
            }
        );

        child.on('exit', (code, signal) => {
            resolve(signal ? 1 : (code ?? 1));
        });
    });

let exitCode = 1;

try {
    await server.listen();
    exitCode = await runPlaywright();
} finally {
    await server.close();
}

process.exit(exitCode);
