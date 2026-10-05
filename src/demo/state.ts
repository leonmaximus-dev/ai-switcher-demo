import { agents, createDemoAccounts, type AgentId, type DemoAccount, type DemoAccounts } from './catalog';

export const storageKey = 'ai-switcher-demo:v1';
export interface SavedDemo {
  accounts: DemoAccounts;
  selected: AgentId;
  visible: AgentId[];
  privacy: boolean;
  theme: 'light' | 'dark';
}

export function defaultState(): SavedDemo {
  return { accounts: createDemoAccounts(), selected: 'cursor', visible: agents.map(a => a.id), privacy: false, theme: 'light' };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAccount(value: unknown): value is DemoAccount {
  return isRecord(value) && typeof value.id === 'string' && value.id.length > 0 && value.id.length <= 100
    && typeof value.name === 'string' && value.name.trim().length > 0 && value.name.length <= 24
    && typeof value.email === 'string' && value.email.length <= 100
    && typeof value.plan === 'string' && value.plan.length <= 40
    && typeof value.remaining === 'number' && Number.isFinite(value.remaining) && value.remaining >= 0 && value.remaining <= 100
    && typeof value.reset === 'string' && value.reset.length <= 60
    && typeof value.updated === 'string' && value.updated.length <= 60;
}

/** 不信任浏览器缓存；逐个应用恢复，损坏的应用使用默认数据。 */
export function parseState(raw: string | null): SavedDemo {
  const fallback = defaultState();
  try {
    const value: unknown = JSON.parse(raw ?? 'null');
    if (!isRecord(value)) return fallback;
    const accounts = fallback.accounts;
    if (isRecord(value.accounts)) {
      for (const agent of agents) {
        const entry = value.accounts[agent.id];
        if (!isRecord(entry) || !Array.isArray(entry.accounts) || !entry.accounts.length || entry.accounts.length > 100) continue;
        if (!entry.accounts.every(isAccount)) continue;
        const ids = entry.accounts.map(a => a.id);
        if (new Set(ids).size !== ids.length || typeof entry.active !== 'string' || !ids.includes(entry.active)) continue;
        // 只复制允许的字段，避免缓存里的额外字段进入公开演示状态。
        accounts[agent.id] = { active: entry.active, accounts: entry.accounts.map(({ id, name, email, plan, remaining, reset, updated }) => ({ id, name, email, plan, remaining, reset, updated })) };
      }
    }
    const visible = Array.isArray(value.visible)
      ? agents.filter(a => value.visible instanceof Array && value.visible.includes(a.id)).map(a => a.id)
      : fallback.visible;
    if (!visible.length) visible.push(...fallback.visible);
    return { accounts, visible, selected: visible.includes(value.selected as AgentId) ? value.selected as AgentId : visible[0], privacy: value.privacy === true, theme: value.theme === 'dark' ? 'dark' : 'light' };
  } catch { return fallback; }
}

export function initialState(): SavedDemo {
  try { return parseState(localStorage.getItem(storageKey)); }
  catch { return defaultState(); }
}
