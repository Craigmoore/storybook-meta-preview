import { WebSocket } from 'ws';
import { gridToAnsi } from './ansi.js';

const RELAY_HOST = process.env.RELAY_HOST ?? 'localhost';
const RELAY_PORT = process.env.RELAY_PORT ?? '3340';

const ws = new WebSocket(`ws://${RELAY_HOST}:${RELAY_PORT}`);

function sendResize() {
  if (ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify({
    type: 'resize',
    cols: process.stdout.columns ?? 80,
    rows: process.stdout.rows   ?? 24,
  }));
}

ws.on('open', () => {
  ws.send(JSON.stringify({ type: 'register', role: 'tui-preview' }));
  sendResize();
  process.stdout.write('\x1b[?25l'); // hide cursor
  process.stdout.write('\x1b[2J\x1b[H'); // clear screen
});

ws.on('message', (raw) => {
  let msg;
  try { msg = JSON.parse(raw.toString()); } catch { return; }
  if (msg.type === 'story-rendered' && msg.tuiData) {
    process.stdout.write(gridToAnsi(msg.tuiData));
  }
});

ws.on('error', (err) => {
  console.error(`[tui-terminal] connection error: ${err.message}`);
});

ws.on('close', () => {
  process.stdout.write('\x1b[?25h\x1b[0m\n');
  console.error('[tui-terminal] disconnected');
});

process.on('SIGWINCH', sendResize);

function cleanup() {
  process.stdout.write('\x1b[?25h'); // show cursor
  process.stdout.write('\x1b[0m');   // reset colours
  process.stdout.write('\x1b[2J\x1b[H'); // clear screen
  ws.close();
  process.exit(0);
}

process.on('SIGINT',  cleanup);
process.on('SIGTERM', cleanup);
