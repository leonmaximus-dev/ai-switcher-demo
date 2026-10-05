import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = await readdir(path.join(root, 'dist/assets'));
let javascript = await readFile(path.join(root, 'dist/assets', assets.find(name => name.endsWith('.js'))), 'utf8');
const css = await readFile(path.join(root, 'dist/assets', assets.find(name => name.endsWith('.css'))), 'utf8');
const files = ['demo-icon.svg', ...(await readdir(path.join(root, 'public/logos'))).map(name => `logos/${name}`)];
const mime = { '.svg': 'image/svg+xml', '.png': 'image/png' };
let favicon;
for (const file of files) {
  const bytes = await readFile(path.join(root, 'public', file));
  const data = `data:${mime[path.extname(file)]};base64,${bytes.toString('base64')}`;
  javascript = javascript.replaceAll(JSON.stringify(`/${file}`), JSON.stringify(data));
  javascript = javascript.replaceAll(JSON.stringify(file), JSON.stringify(data));
  if (file === 'demo-icon.svg') favicon = data;
}
if (/['"]\/?logos\//.test(javascript)) throw new Error('仍有未内嵌的图标。');
javascript = javascript.replaceAll('</script', '<\\/script');
const notices = (await Promise.all(['LICENSE', 'docs/third-party/lobe-icons-LICENSE.txt'].map(file => readFile(path.join(root, file), 'utf8')))).join('\n\n').replaceAll('-->', '--&gt;');
const html = `<!doctype html><!--\nAI Switcher 与 Lobe Icons 许可声明\n${notices}\n--><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="AI Switcher 轻量交互演示，包含 16 个应用界面。所有账号与额度均为示例数据。"><link rel="icon" href="${favicon}"><title>AI Switcher · 演示版</title><style>${css}</style></head><body><div id="root"></div><script type="module">${javascript}</script></body></html>`;
await mkdir(path.join(root, 'demo-release'), { recursive: true });
await writeFile(path.join(root, 'demo-release/AI-Switcher-Demo.html'), html);
console.log(`独立演示文件已导出：${Math.round(Buffer.byteLength(html) / 1024)} KB`);
