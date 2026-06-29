import express from 'express';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 3001);
const dbPath = process.env.CARTWISE_DB_PATH
  ? path.resolve(process.env.CARTWISE_DB_PATH)
  : path.resolve(__dirname, '../../Scrapper/datos/comparadores/comparador.sqlite');
const bridgePath = path.resolve(__dirname, 'sqlite_bridge.py');
const distPath = path.resolve(__dirname, '../dist');

app.use(express.json({limit: '1mb'}));

type BridgePayload = Record<string, unknown>;

function runBridge(operation: string, payload: BridgePayload = {}) {
  return new Promise<any>((resolve, reject) => {
    const child = spawn('python3', [bridgePath, dbPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`SQLite query timed out for ${operation}`));
    }, 15000);

    child.stdout.on('data', (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk);
    });
    child.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(stderr || `SQLite bridge exited with ${code}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout || '{}'));
      } catch (error) {
        reject(error);
      }
    });

    child.stdin.write(JSON.stringify({operation, payload}));
    child.stdin.end();
  });
}

function asyncRoute(handler: express.RequestHandler): express.RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

app.get('/api/health', asyncRoute(async (_req, res) => {
  const data = await runBridge('health');
  res.json(data);
}));

app.get('/api/deals/top', asyncRoute(async (req, res) => {
  const data = await runBridge('topDeals', {
    limit: Number(req.query.limit || 8),
  });
  res.json(data);
}));

app.get('/api/products/search', asyncRoute(async (req, res) => {
  const data = await runBridge('searchProducts', {
    q: String(req.query.q || ''),
    limit: Number(req.query.limit || 12),
  });
  res.json(data);
}));

app.get('/api/generic/search', asyncRoute(async (req, res) => {
  const data = await runBridge('searchGeneric', {
    q: String(req.query.q || ''),
    limit: Number(req.query.limit || 8),
  });
  res.json(data);
}));

app.get('/api/products/:id/offers', asyncRoute(async (req, res) => {
  const data = await runBridge('productOffers', {
    id: Number(req.params.id),
  });
  res.json(data);
}));

app.post('/api/basket/compare', asyncRoute(async (req, res) => {
  const data = await runBridge('compareBasket', {
    items: Array.isArray(req.body?.items) ? req.body.items : [],
  });
  res.json(data);
}));

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({
    error: 'api_error',
    message: error.message,
  });
});

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Cartwise API listening on http://0.0.0.0:${port}`);
  console.log(`Using SQLite mart: ${dbPath}`);
});
