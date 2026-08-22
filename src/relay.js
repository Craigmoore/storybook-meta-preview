import express from 'express';
import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { readFileSync, existsSync } from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(express.static(join(__dirname, '..', 'public')));

const certPath = join(__dirname, '..', 'certs', 'cert.pem');
const keyPath  = join(__dirname, '..', 'certs', 'cert-key.pem');
const useHttps = existsSync(certPath) && existsSync(keyPath);

// Shared client set — both HTTP and HTTPS WebSocket servers write here
const clients = new Set();

function handleConnection(ws) {
  ws.role = 'unknown';
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    if (msg.type === 'register') {
      ws.role = msg.role;
      return;
    }

    if (msg.type === 'story-rendered' && ws.role === 'storybook-channel') {
      const payload = JSON.stringify(msg);
      for (const client of clients) {
        if (
          (client.role === 'meta-preview' || client.role === 'banter-inject' || client.role === 'altspace-inject' || client.role === 'tui-preview' || client.role === 'sdf2d-preview' || client.role === 'sdf3d-preview' || client.role === 'bantervr-sdf3d-inject')
          && client.readyState === WebSocket.OPEN
        ) {
          client.send(payload);
        }
      }
    }

    if (msg.type === 'resize' && ws.role === 'tui-preview') {
      const payload = JSON.stringify({ type: 'tui-resize', cols: msg.cols, rows: msg.rows });
      for (const client of clients) {
        if (client.role === 'storybook-channel' && client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      }
    }
  });
}

// HTTP server — used by Storybook channel and local meta-preview clients
const PORT = process.env.PORT ?? 3333;
const httpServer = createHttpServer(app);
const wssHttp = new WebSocketServer({ server: httpServer });
wssHttp.on('connection', handleConnection);
httpServer.listen(PORT, () => {
  console.log(`Relay (HTTP) → http://localhost:${PORT}`);
  console.log(`  Meta Preview → http://localhost:${PORT}/meta-preview.html`);
});

// HTTPS server — used by external clients (e.g. Banter) on PORT+1
if (useHttps) {
  const tlsOpts = { cert: readFileSync(certPath), key: readFileSync(keyPath) };
  const httpsServer = createHttpsServer(tlsOpts, app);
  const wssHttps = new WebSocketServer({ server: httpsServer });
  wssHttps.on('connection', handleConnection);
  const HTTPS_PORT = Number(PORT) * 10;
  httpsServer.listen(HTTPS_PORT, () => {
    console.log(`Relay (HTTPS) → https://localhost:${HTTPS_PORT}`);
  });
}
