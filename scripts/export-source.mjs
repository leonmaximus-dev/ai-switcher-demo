import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// 使用新的目录，避免覆盖已有的下载、源码或用户修改。
const output = path.join(root, 'source-release', `AI-Switcher-${Date.now()}`);
const files = [
  'package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts', 'index.html',
  '.gitignore', 'LICENSE', 'README.md', 'CONTRIBUTING.md', 'SECURITY.md',
  'src/main.tsx', 'src/App.tsx',
  'scripts/export-demo.mjs', 'scripts/serve-demo.mjs', 'scripts/verify-demo.mjs',
  'scripts/fetch-demo-logos.mjs', 'scripts/export-source.mjs',
  'docs/演示版说明.md', 'docs/开发路线.md', 'docs/发布说明.md',
  'docs/third-party/demo-logo-sources.json', 'docs/third-party/lobe-icons-LICENSE.txt',
  '.github/workflows/check.yml', '.github/workflows/release.yml',
  '.github/ISSUE_TEMPLATE/bug_report.md', '.github/ISSUE_TEMPLATE/feature_request.md',
  '.github/pull_request_template.md',
  'public/demo-icon.svg',
];
for (const directory of ['src/demo', 'public/logos']) {
  for (const file of await readdir(path.join(root, directory))) {
    if (file === 'zcode.svg') continue; // 不发布未使用的旧图标。
    files.push(`${directory}/${file}`);
  }
}
// 截图为公开演示数据，单独复制至稳定的文档路径。
for (const name of ['light', 'dark', 'mobile']) {
  const target = path.join(output, `docs/images/demo-${name}.png`);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(path.join(root, `docs/local/demo-${name}.png`), target);
}
for (const file of files) {
  const target = path.join(output, file);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(path.join(root, file), target);
}
await writeFile(path.join(output, '源码清单.json'), JSON.stringify({ files: [...files, ...['light','dark','mobile'].map(name => `docs/images/demo-${name}.png`)], includesGitHistory: false, includesNativeBackend: false }, null, 2));
const pkg = JSON.parse(await readFile(path.join(output, 'package.json'), 'utf8'));
if (Object.keys(pkg.dependencies).some(name => name.startsWith('@tauri-apps/'))) throw new Error('公开演示包仍包含原生依赖。');
console.log(`可上传的干净源码目录：${output}`);
