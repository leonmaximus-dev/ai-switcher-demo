import { mkdir, writeFile } from 'node:fs/promises';

const root = new URL('../public/logos/', import.meta.url);
await mkdir(root, { recursive: true });
const brands = {
  codex: ['openai'], claude: ['claude-color', 'claude'], cursor: ['cursor'],
  antigravity: ['antigravity-color', 'antigravity'], gemini: ['gemini-color'],
  windsurf: ['windsurf'], opencode: ['opencode'], copilot: ['githubcopilot'],
  qoder: ['qoder'], trae: ['trae-color', 'trae'],
  codebuddy: ['codebuddy-color', 'codebuddy'], kimi: ['kimi'], qwen: ['qwen-color'],
};
const manifest = [];
await Promise.all(Object.entries(brands).map(async ([id, slugs]) => {
  for (const slug of slugs) {
    const source = `https://raw.githubusercontent.com/lobehub/lobe-icons/master/packages/static-svg/icons/${slug}.svg`;
    const response = await fetch(source);
    if (!response.ok) continue;
    let svg = await response.text();
    if (!svg.includes('<svg') || /<script|<foreignObject|\bon\w+=/i.test(svg)) throw new Error(`图标内容异常：${id}`);
    svg = svg.replaceAll('currentColor', '#292b30');
    await writeFile(new URL(`${id}.svg`, root), svg);
    manifest.push({ id, source, library: 'Lobe Icons', license: 'MIT' });
    console.log(`已获取：${id}`);
    return;
  }
  throw new Error(`无法获取图标：${id}`);
}));
await Promise.all([
  ['factory', 'factory.svg', 'https://factory.ai/favicon.svg'],
  ['typeless', 'typeless.png', 'https://www.typeless.com/logo_152.png'],
  ['zcode', 'zcode.png', 'https://zcode.z.ai/favicon-192x192.png?v=20260707-transparent'],
].map(async ([id, filename, source]) => {
  const response = await fetch(source);
  if (!response.ok) throw new Error(`无法获取官方图标：${id}`);
  await writeFile(new URL(filename, root), Buffer.from(await response.arrayBuffer()));
  manifest.push({ id, source, library: '官方网站' });
  console.log(`已获取官方图标：${id}`);
}));
await mkdir(new URL('../docs/third-party/', import.meta.url), { recursive: true });
await writeFile(new URL('../docs/third-party/demo-logo-sources.json', import.meta.url), JSON.stringify(manifest, null, 2));
const license = await fetch('https://raw.githubusercontent.com/lobehub/lobe-icons/master/LICENSE');
if (license.ok) await writeFile(new URL('../docs/third-party/lobe-icons-LICENSE.txt', import.meta.url), await license.text());
