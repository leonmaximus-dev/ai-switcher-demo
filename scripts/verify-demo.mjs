import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { startServer } from './serve-demo.mjs';
const server = await startServer(0);
const baseURL = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}), headless: true });
} catch (error) {
  server.close();
  throw new Error('浏览器启动失败，请运行 npx playwright install chromium，或设置 PLAYWRIGHT_EXECUTABLE_PATH。', { cause: error });
}
const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = []; const external = []; const checks = [];
page.on('pageerror', error => errors.push(error.message));
page.on('request', request => { if (!request.url().startsWith(baseURL + '/') && !request.url().startsWith('data:') && !request.url().startsWith('file:')) external.push(request.url()); });
function check(condition, message) { if (!condition) throw new Error(message); checks.push(message); }
await mkdir('docs/local', { recursive: true });
try {
  await page.goto(baseURL);
  await page.getByRole('heading', { name: 'Cursor', exact: true }).waitFor();
  check(await page.locator('.agent-tile').count() === 16, '16 个应用入口');
  await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0));
  check(await page.locator('.demo-account').count() === 3, '默认展示 3 个账号');
  await page.screenshot({ path: 'docs/local/demo-light.png', fullPage: true });
  for (const name of ['Qoder','ZCode','TRAE','CodeBuddy','Kimi Code','Qwen Code','Antigravity','Claude Code','Gemini CLI','Windsurf','OpenCode','GitHub Copilot','Factory / Droid','Typeless','ChatGPT / Codex','Cursor']) {
    await page.getByRole('button', { name, exact: true }).click();
    check(await page.getByRole('heading', { name, exact: true }).isVisible(), `${name} 页面可打开`);
  }
  await page.getByRole('article', { name: '工作账号账号卡片' }).getByRole('button', { name: '切换账号', exact: true }).click();
  await page.getByRole('button', { name: '确认切换', exact: true }).click();
  await page.getByRole('status').filter({ hasText: '演示已切换' }).waitFor();
  check((await page.locator('.demo-account.active').innerText()).includes('工作账号'), '切换更新当前账号');
  await page.getByRole('button', { name: 'Qoder', exact: true }).click();
  check((await page.locator('.demo-account.active').innerText()).includes('主力账号'), '应用之间切换状态独立');
  await page.getByRole('button', { name: 'Cursor', exact: true }).click();
  await page.reload();
  check((await page.locator('.demo-account.active').innerText()).includes('工作账号'), '刷新后保留演示状态');
  await page.getByRole('button', { name: '刷新示例状态', exact: true }).click();
  await page.getByRole('article', { name: '备用账号账号卡片' }).getByRole('button', { name: '切换账号', exact: true }).click();
  await page.getByRole('button', { name: '确认切换', exact: true }).click();
  await page.getByRole('button', { name: '取消', exact: true }).click();
  await page.waitForTimeout(1500);
  check((await page.locator('.demo-account.active').innerText()).includes('工作账号'), '取消切换不会改变当前账号');
  check(await page.getByRole('button', { name: '刷新示例状态', exact: true }).isEnabled(), '取消切换不会中断独立的刷新状态');
  await page.getByRole('button', { name: '隐私模式', exact: true }).click();
  check(!(await page.locator('.demo-main').innerText()).includes('example.com'), '隐私模式隐藏邮箱');
  await page.getByRole('button', { name: '添加账号', exact: true }).click();
  await page.getByPlaceholder('例如：创作账号').fill('录屏账号');
  await page.getByRole('button', { name: '添加演示账号', exact: true }).click();
  check(await page.locator('.demo-account').count() === 4, '可添加演示账号');
  await page.getByRole('textbox', { name: '搜索账号', exact: true }).fill('录屏');
  check(await page.locator('.demo-account').count() === 1, '账号搜索有效');
  await page.getByRole('button', { name: '清空搜索' }).click();
  await page.getByRole('button', { name: '移除录屏账号', exact: true }).click();
  await page.getByRole('button', { name: '移除账号', exact: true }).click();
  check(await page.locator('.demo-account').count() === 3, '可移除演示账号');
  await page.getByRole('button', { name: '国内', exact: true }).click();
  check(await page.locator('.agent-tile').count() === 6, '国内应用筛选');
  await page.getByRole('button', { name: '管理应用', exact: true }).click();
  await page.getByRole('checkbox', { name: '显示ZCode', exact: true }).uncheck();
  await page.getByRole('button', { name: '完成', exact: true }).click();
  check(await page.locator('.agent-tile').count() === 15, '应用显示与隐藏');
  await page.getByRole('button', { name: '演示设置', exact: true }).click();
  await page.getByRole('button', { name: '重置演示数据', exact: true }).click();
  check(await page.locator('.agent-tile').count() === 16, '重置恢复全部应用');
  await page.getByRole('button', { name: '关闭通知', exact: true }).click();
  await page.getByRole('button', { name: '切换深色主题', exact: true }).click();
  await page.screenshot({ path: 'docs/local/demo-dark.png', fullPage: true });
  await page.getByRole('article', { name: '工作账号账号卡片' }).getByRole('button', { name: '切换账号', exact: true }).click();
  await page.screenshot({ path: 'docs/local/demo-switch.png', fullPage: true });
  await page.keyboard.press('Escape');
  check(await page.getByRole('dialog').count() === 0, '弹窗可用 Escape 关闭');
  await page.getByRole('button', { name: '切换浅色主题', exact: true }).click();
  await page.getByRole('button', { name: '隐私模式', exact: true }).click();
  for (const width of [940, 540, 390, 320]) {
    await page.setViewportSize({ width, height: 940 });
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px 无横向溢出`);
    if (width === 390) await page.screenshot({ path: 'docs/local/demo-mobile.png', fullPage: true });
  }
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.screenshot({ path: 'docs/local/demo-light.png', fullPage: true });
  const offline = await context.newPage();
  offline.on('pageerror', error => errors.push(error.message));
  await offline.route('http://**/*', route => route.abort()); await offline.route('https://**/*', route => route.abort());
  await offline.goto(pathToFileURL(path.resolve('demo-release/AI-Switcher-Demo.html')).href);
  await offline.getByRole('heading', { name: 'Cursor', exact: true }).waitFor();
  await offline.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0));
  check(await offline.locator('.agent-tile').count() === 16, '独立 HTML 离线可打开且图标完整');
  await offline.getByRole('button', { name: 'ZCode', exact: true }).click();
  await offline.getByRole('button', { name: '添加账号', exact: true }).click();
  await offline.getByPlaceholder('例如：创作账号').fill('离线账号');
  await offline.getByRole('button', { name: '添加演示账号', exact: true }).click();
  check(await offline.locator('.demo-account').count() === 4, '独立 HTML 离线添加账号可用');
  check(errors.length === 0, '无页面运行错误'); check(external.length === 0, '不发起外部网络请求');
  await writeFile('docs/local/demo-verification.json', JSON.stringify({ passed: true, checks, errors, externalRequests: external, realAccountSwitchPerformed: false }, null, 2));
  console.log(`界面核验通过：${checks.length} 项；真实账号切换：未执行`);
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
