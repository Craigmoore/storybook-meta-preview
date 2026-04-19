import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(join(__dirname, '..', 'public')));

wss.on('connection', (ws) => {
  ws.role = 'unknown';

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    if (msg.type === 'register') {
      ws.role = msg.role;
      return;
    }

    // storybook-channel sends story renders — broadcast to all meta-preview clients
    if (msg.type === 'story-rendered' && ws.role === 'storybook-channel') {
      const payload = JSON.stringify(msg);
      wss.clients.forEach((client) => {
        if (client.role === 'meta-preview' && client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });
    }
  });
});

const PORT = process.env.PORT ?? 3333;
server.listen(PORT, () => {
  console.log(`Relay running on http://localhost:${PORT}`);
  console.log(`  Meta Preview → http://localhost:${PORT}/meta-preview.html`);
});
