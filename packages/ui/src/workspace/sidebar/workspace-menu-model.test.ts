import { describe, expect, test } from 'bun:test';

import { workspaceMenuGroups } from './workspace-menu-model';

const ALL = { canInvite: true, canOpenSettings: true, canLeave: true, hasInbox: true };
const NONE = { canInvite: false, canOpenSettings: false, canLeave: false, hasInbox: false };

describe('workspaceMenuGroups — the workspace menu, top to bottom', () => {
  test('an owner of a shared workspace: the workspace, then the person, then Leave above Log out', () => {
    expect(workspaceMenuGroups(ALL)).toEqual([
      ['header'],
      ['invite', 'settings', 'switch'],
      ['inbox', 'preferences', 'appearance'],
      ['apps', 'download', 'help'],
      ['leave', 'logout'],
    ]);
  });

  test('a member: no Invite, no Workspace settings, and Leave', () => {
    expect(workspaceMenuGroups({ ...NONE, canLeave: true })).toEqual([
      ['header'],
      ['switch'],
      ['preferences', 'appearance'],
      ['apps', 'download', 'help'],
      ['leave', 'logout'],
    ]);
  });

  test('the last owner gets no Leave, and Log out stays last', () => {
    const rows = workspaceMenuGroups({ ...ALL, canLeave: false }).flat();
    expect(rows).not.toContain('leave');
    expect(rows.at(-1)).toBe('logout');
  });

  test('every row sits at the top level: no More row hides other rows', () => {
    const rows = workspaceMenuGroups(ALL).flat() as string[];
    expect(rows).not.toContain('more');
    for (const row of ['apps', 'appearance', 'help', 'download']) expect(rows).toContain(row);
    // Create workspace stays at the foot of the Switch workspace list.
    expect(rows).not.toContain('create');
  });

  test('the Inbox is a menu row above Preferences, below the workspace rows (KRTX-1742)', () => {
    const rows = workspaceMenuGroups(ALL).flat();
    expect(rows.indexOf('inbox')).toBeGreaterThan(rows.indexOf('switch'));
    expect(rows.indexOf('preferences')).toBe(rows.indexOf('inbox') + 1);
  });

  test('a host that serves no Inbox page gets no Inbox row', () => {
    expect(workspaceMenuGroups({ ...ALL, hasInbox: false }).flat()).not.toContain('inbox');
  });
});
