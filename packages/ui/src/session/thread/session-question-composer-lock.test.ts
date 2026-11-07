/**
 * The question gate on the composer: a rendered question card owns the
 * composer, on a busy AND on an idle session.
 *
 * KRTX-4450 (the recorded broken question/answer UX): while a question card
 * was docked on the composer the locked gate still read
 * `!!renderedQuestion && isBusy`, so on an idle session every custom answer
 * typed into the composer went out as a plain user prompt instead of being
 * consumed by the question — the transcript showed the text as a bubble while
 * the question card stayed up, and the same text typed on the Confirm step
 * also escaped as a prompt. A question card only renders while the question
 * it draws can be answered (the pending list holds live and parked asks, see
 * `pendingQuestions`), so the card on screen is always the answer target and
 * the gate must not second-guess the run state.
 *
 * Source assertions, for the reason every other composer test pins its file:
 * this wiring lives inline in `SessionChat`'s `SessionChatInput` props, and
 * the composer sits behind a React.lazy boundary; see
 * composer-submit-latch.test.ts's header for the same choice.
 */
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = readFileSync(
  fileURLToPath(new URL('./session-chat.tsx', import.meta.url)),
  'utf8',
);

/** The file with comments removed, for assertions about what CODE references. */
function code(): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n');
}

function propOf(name: string): string {
  // Find `<propName>={` … `}` on one line, inside the composer props.
  const match = code().match(new RegExp(`${name}=\\{([^}]*)\\}`));
  return match?.[1] ?? '';
}

describe('the composer question gate (KRTX-4450)', () => {
  test('a rendered question card locks the composer without the run state', () => {
    expect(propOf('lockForQuestion')).toBe('!!renderedQuestion');
  });

  test('the gate no longer requires isBusy on the question prop', () => {
    const prop = propOf('lockForQuestion');
    expect(prop).not.toContain('isBusy');
  });

  test('the doc comment keeps the always-lock contract', () => {
    // The stale rationale ("idle sessions must keep the input unlocked") is
    // exactly the behavior the recording shows as broken; it must not come
    // back quietly.
    const comment = source.match(/A question card owns the composer whenever[\s\S]*?\*\//)?.[0] ?? '';
    expect(comment).toContain('renders');
    expect(comment).not.toMatch(/isBusy.*unlocked|stays unlocked/i);
  });
});
