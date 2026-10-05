import { describe, expect, it } from 'vitest';
import { agents } from './catalog';
import { defaultState, parseState } from './state';

describe('演示状态恢复', () => {
  it('无缓存或损坏的 JSON 可以启动', () => {
    for (const raw of [null, '{', 'null', '[]', '42']) expect(parseState(raw)).toEqual(defaultState());
  });
  it('保留合法数据和隐私、主题设置', () => {
    const state = defaultState();
    state.accounts.cursor.active = 'cursor-work'; state.theme = 'dark'; state.privacy = true;
    expect(parseState(JSON.stringify(state))).toEqual(state);
  });
  it('单个应用损坏不丢失其他应用的状态', () => {
    const state = defaultState(); state.accounts.qoder.active = 'qoder-work';
    const corrupt = JSON.parse(JSON.stringify(state)); corrupt.accounts.cursor.accounts = [null];
    const restored = parseState(JSON.stringify(corrupt));
    expect(restored.accounts.cursor).toEqual(defaultState().accounts.cursor);
    expect(restored.accounts.qoder.active).toBe('qoder-work');
  });
  it.each(['id', 'name', 'email', 'plan', 'reset', 'updated'])('拒绝缺失的 %s 字段', field => {
    const state = JSON.parse(JSON.stringify(defaultState())); delete state.accounts.cursor.accounts[0][field];
    state.accounts.cursor.active = 'cursor-work';
    expect(parseState(JSON.stringify(state)).accounts.cursor.active).toBe('cursor-main');
  });
  it.each([-1, 101, '72', null])('拒绝越界或无效额度 %s', remaining => {
    const state = JSON.parse(JSON.stringify(defaultState())); state.accounts.cursor.accounts[0].remaining = remaining;
    expect(parseState(JSON.stringify(state)).accounts.cursor).toEqual(defaultState().accounts.cursor);
  });
  it('拒绝重复账号标识及无效当前账号', () => {
    const state = defaultState(); state.accounts.cursor.accounts[1].id = 'cursor-main';
    expect(parseState(JSON.stringify(state)).accounts.cursor).toEqual(defaultState().accounts.cursor);
    state.accounts.cursor.active = 'missing';
    expect(parseState(JSON.stringify(state)).accounts.cursor.active).toBe('cursor-main');
  });
  it('过滤未知应用、重复应用及隐藏的当前应用', () => {
    const state = { ...defaultState(), visible: ['qoder', 'qoder', 'unknown'], selected: 'cursor' };
    expect(parseState(JSON.stringify(state)).visible).toEqual(['qoder']);
    expect(parseState(JSON.stringify(state)).selected).toBe('qoder');
  });
  it('空列表恢复所有应用，新增应用自动获得默认账号', () => {
    expect(parseState(JSON.stringify({ accounts: {}, visible: [] })).visible).toHaveLength(agents.length);
    expect(parseState(JSON.stringify({ accounts: {}, visible: ['cursor'] })).accounts).toEqual(defaultState().accounts);
  });
  it('丢弃未知缓存字段', () => {
    const state = JSON.parse(JSON.stringify(defaultState())); state.accounts.cursor.accounts[0].token = 'unexpected';
    expect(parseState(JSON.stringify(state)).accounts.cursor.accounts[0]).not.toHaveProperty('token');
  });
});
