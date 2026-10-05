export type AgentId = 'codex' | 'claude' | 'cursor' | 'antigravity' | 'gemini' | 'windsurf' | 'opencode' | 'copilot' | 'qoder' | 'zcode' | 'trae' | 'codebuddy' | 'kimi' | 'qwen' | 'factory' | 'typeless';
export interface Agent { id: AgentId; name: string; maker: string; region: 'domestic' | 'global'; logo: string; color: string; kind: string }
export interface DemoAccount { id: string; name: string; email: string; plan: string; remaining: number; reset: string; updated: string }
export interface AgentAccounts { active: string; accounts: DemoAccount[] }
export type DemoAccounts = Record<AgentId, AgentAccounts>;

export const agents: Agent[] = [
  { id: 'codex', name: 'ChatGPT / Codex', maker: 'OpenAI', region: 'global', logo: 'logos/codex.svg', color: '#171717', kind: '编程与通用助手' },
  { id: 'claude', name: 'Claude Code', maker: 'Anthropic', region: 'global', logo: 'logos/claude.svg', color: '#d97757', kind: '终端编程助手' },
  { id: 'cursor', name: 'Cursor', maker: 'Cursor', region: 'global', logo: 'logos/cursor.svg', color: '#333333', kind: 'AI 代码编辑器' },
  { id: 'antigravity', name: 'Antigravity', maker: 'Google', region: 'global', logo: 'logos/antigravity.svg', color: '#4285f4', kind: 'Agent 开发工具' },
  { id: 'gemini', name: 'Gemini CLI', maker: 'Google', region: 'global', logo: 'logos/gemini.svg', color: '#5678e8', kind: '终端编程助手' },
  { id: 'windsurf', name: 'Windsurf', maker: 'Windsurf', region: 'global', logo: 'logos/windsurf.svg', color: '#0f998a', kind: 'AI 代码编辑器' },
  { id: 'opencode', name: 'OpenCode', maker: 'OpenCode', region: 'global', logo: 'logos/opencode.svg', color: '#53545a', kind: '开源编程助手' },
  { id: 'copilot', name: 'GitHub Copilot', maker: 'GitHub', region: 'global', logo: 'logos/copilot.svg', color: '#5259d6', kind: '编程助手' },
  { id: 'qoder', name: 'Qoder', maker: 'Qoder', region: 'domestic', logo: 'logos/qoder.svg', color: '#3b9d67', kind: 'Agent 编程平台' },
  { id: 'zcode', name: 'ZCode', maker: '智谱', region: 'domestic', logo: 'logos/zcode.png', color: '#345af5', kind: 'Agent 开发工具' },
  { id: 'trae', name: 'TRAE', maker: '字节跳动', region: 'domestic', logo: 'logos/trae.svg', color: '#239b78', kind: 'AI 代码编辑器' },
  { id: 'codebuddy', name: 'CodeBuddy', maker: '腾讯', region: 'domestic', logo: 'logos/codebuddy.svg', color: '#3b67ff', kind: 'AI 编程助手' },
  { id: 'kimi', name: 'Kimi Code', maker: '月之暗面', region: 'domestic', logo: 'logos/kimi.svg', color: '#225cff', kind: '终端编程助手' },
  { id: 'qwen', name: 'Qwen Code', maker: '通义', region: 'domestic', logo: 'logos/qwen.svg', color: '#7760df', kind: '开源编程助手' },
  { id: 'factory', name: 'Factory / Droid', maker: 'Factory', region: 'global', logo: 'logos/factory.svg', color: '#d87a55', kind: 'Agent 开发工具' },
  { id: 'typeless', name: 'Typeless', maker: 'Typeless', region: 'global', logo: 'logos/typeless.png', color: '#161616', kind: 'AI 语音输入' },
];

export function createDemoAccounts(): DemoAccounts {
  return Object.fromEntries(agents.map((agent, index) => [agent.id, {
    active: `${agent.id}-main`, accounts: [
      { id: `${agent.id}-main`, name: '主力账号', email: 'creator@example.com', plan: ['cursor','claude','qoder','windsurf','copilot'].includes(agent.id) ? 'Pro' : '个人账号', remaining: 72 - index % 4 * 3, reset: '2 小时 18 分钟', updated: '刚刚' },
      { id: `${agent.id}-work`, name: '工作账号', email: 'studio@example.com', plan: '工作账号', remaining: 94 - index % 3 * 2, reset: '4 小时 32 分钟', updated: '刚刚' },
      { id: `${agent.id}-backup`, name: '备用账号', email: 'backup@example.com', plan: '备用账号', remaining: 18 + index % 3 * 4, reset: '58 分钟', updated: '刚刚' },
    ],
  }])) as DemoAccounts;
}
