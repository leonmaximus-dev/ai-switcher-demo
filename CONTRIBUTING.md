# 参与开发

使用 Node.js 22 或更新版本。Windows、macOS、Linux 均可运行前端。

```sh
npm ci
npm run dev
```

默认预览为 `http://127.0.0.1:1438`。提交 PR 前运行：

```sh
npm test
npm run demo:export
npx playwright install chromium
npm run demo:verify
```

测试脚本会自动启动临时本地服务并在结束后关闭，无需另开预览服务。需要使用现有浏览器时，将 `PLAYWRIGHT_EXECUTABLE_PATH` 环境变量设置为浏览器可执行文件路径。

## 代码入口

- `src/demo/catalog.ts`：应用目录、类型与默认示例账号。
- `src/demo/state.ts`：缓存校验与恢复。
- `src/demo/AgentDemo.tsx`：交互界面。
- `src/demo/base.css`、`src/demo/demo.css`：基础样式和界面样式。
- `scripts/export-demo.mjs`：生成离线 HTML。
- `scripts/verify-demo.mjs`：浏览器核验。

新增应用时更新目录类型、图标、默认数据和核验脚本中的应用列表；将图标来源记入 `docs/third-party/demo-logo-sources.json`。真实应用适配请先讨论范围和官方认证方式，参考 [开发路线](docs/开发路线.md)。

界面说明和文档使用中文，代码标识符和产品名称保留原文。不要添加真实邮箱、凭据或机器上的个人路径。视觉变化请提供浅色、深色和移动端截图。
