import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
export function startServer(port = Number(process.env.PORT ?? 1437)) {
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1');
    const requestPath = decodeURIComponent(url.pathname);
    const target = path.resolve(root, `.${requestPath === '/' ? '/index.html' : requestPath}`);
    if (!target.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    const bytes = await readFile(target);
    res.writeHead(200, { 'Content-Type': mime[path.extname(target)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(bytes);
  } catch { res.writeHead(404); res.end('未找到文件'); }
});
return new Promise((resolve, reject) => {
  server.on('error', reject);
  server.listen(port, '127.0.0.1', () => resolve(server));
});
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const server = await startServer();
    console.log(`演示已打开：http://127.0.0.1:${server.address().port}`);
  } catch (error) {
    console.error(error.code === 'EADDRINUSE' ? '预览端口已被占用，请使用 PORT 环境变量指定其他端口。' : error.message);
    process.exitCode = 1;
  }
}
