import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = path.join(root, '.local-qa');
const vite = path.join(root, 'node_modules/vite/bin/vite.js');
if (!fs.existsSync(vite)) throw Error('Vite is missing. Install the project dependencies before starting QA.');
fs.mkdirSync(directory, { recursive: true });

async function isThisDevServer(port) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/src/dev/qaState.ts`, { signal: AbortSignal.timeout(600) });
    return response.ok && response.headers.get('content-type')?.includes('javascript') && (await response.text()).includes('gps.qa.progress.v1');
  } catch { return false; }
}
function isPortBusy(port) {
  return new Promise(resolve => {
    const socket = net.connect({ host: '127.0.0.1', port });
    socket.setTimeout(500);
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('error', () => { socket.destroy(); resolve(false); });
    socket.once('timeout', () => { socket.destroy(); resolve(true); });
  });
}

let port;
let reused = false;
for (const candidate of [5173, 5175, 5176]) {
  if (await isThisDevServer(candidate)) { port = candidate; reused = true; break; }
  if (!await isPortBusy(candidate)) { port = candidate; break; }
  console.log(`Port ${candidate} is already in use; its server will be left running.`);
}
if (!port) throw Error('Ports 5173, 5175 and 5176 are busy. No existing server was stopped.');
const url = `http://127.0.0.1:${port}/?qa=1#/course/a1`;
if (!reused) {
  const log = path.join(directory, 'vite.log');
  const output = fs.openSync(log, 'a');
  const child = spawn(process.execPath, [vite, '--host', '127.0.0.1', '--port', String(port), '--strictPort', '--base', '/'], {
    cwd: root, detached: true, stdio: ['ignore', output, output],
  });
  fs.closeSync(output);
  child.on('error', error => { console.error(error.message); process.exitCode = 1; });
  child.unref();
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline && !await isThisDevServer(port)) await new Promise(resolve => setTimeout(resolve, 150));
  if (!await isThisDevServer(port)) throw Error(`Vite did not become ready. Inspect ${log}. No existing server was stopped.`);
  fs.writeFileSync(path.join(directory, 'server.json'), JSON.stringify({ pid: child.pid, port, url, log, startedAt: new Date().toISOString(), detached: true }, null, 2));
  console.log(`Detached Vite development server started (PID ${child.pid}). Log: ${log}`);
} else console.log('Reusing the running local QA development server.');
console.log(`Local QA: ${url}`);
console.log('QA uses separate browser-storage keys. Closing this launcher does not intentionally stop the server.');
