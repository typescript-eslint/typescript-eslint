// Forked from https://github.com/eslint/eslint/blob/ad9dd6a933fd098a0d99c6a9aa059850535c23ee/lib/linter/source-code-fixer.js

import type { Linter } from '@typescript-eslint/utils/ts-eslint';

import { hasOwnProperty } from './hasOwnProperty';

type LintMessage = Linter.LintMessage | Linter.LintSuggestion;
type LintMessageWithFix = LintMessage & Required<Pick<LintMessage, 'fix'>>;

const BOM = '\uFEFF';

/**
 * Compares items in a messages array by range.
 * @returns -1 if a comes before b, 1 if a comes after b, 0 if equal.
 */
function compareMessagesByFixRange(
  a: LintMessageWithFix,
  b: LintMessageWithFix,
): number {
  return a.fix.range[0] - b.fix.range[0] || a.fix.range[1] - b.fix.range[1];
}

/**
 * Compares items in a messages array by line and column.
 * @returns -1 if a comes before b, 1 if a comes after b, 0 if equal.
 */
function compareMessagesByLocation(a: LintMessage, b: LintMessage): number {
  // @ts-expect-error -- it's not possible for suggestions to reach this location
  return a.line - b.line || a.column - b.column;
}

/**
 * Applies the fixes specified by the messages to the given text. Tries to be
 * smart about the fixes and won't apply fixes over the same area in the text.
 * @param sourceText The text to apply the changes to.
 * @param  messages The array of messages reported by ESLint.
 * @returns {Object} An object containing the fixed text and any unfixed messages.
 */
export function applyFixes(
  sourceText: string,
  messages: readonly LintMessage[],
): {
  fixed: boolean;
  messages: readonly LintMessage[];
  output: string;
} {
  // clone the array
  const remainingMessages: LintMessage[] = [];
  const fixes: LintMessageWithFix[] = [];
  const bom = sourceText.startsWith(BOM) ? BOM : '';
  const text = bom ? sourceText.slice(1) : sourceText;
  let lastPos = Number.NEGATIVE_INFINITY;
  let output = bom;

  /**
   * Try to use the 'fix' from a problem.
   * @param {Message} problem The message object to apply fixes from
   * @returns {boolean} Whether fix was successfully applied
   */
  function attemptFix(problem: LintMessageWithFix): boolean {
    const fix = problem.fix;
    const start = fix.range[0];
    const end = fix.range[1];

    // Remain it as a problem if it's overlapped or it's a negative range
    if (lastPos >= start || start > end) {
      remainingMessages.push(problem);
      return false;
    }

    // Remove BOM.
    if ((start < 0 && end >= 0) || (start === 0 && fix.text.startsWith(BOM))) {
      output = '';
    }

    // Make output to this fix.
    output += text.slice(Math.max(0, lastPos), Math.max(0, start));
    output += fix.text;
    lastPos = end;
    return true;
  }

  messages.forEach(problem => {
    if (hasOwnProperty(problem, 'fix')) {
      fixes.push(problem);
    } else {
      remainingMessages.push(problem);
    }
  });

  if (fixes.length) {
    let fixesWereApplied = false;

    for (const problem of fixes.sort(compareMessagesByFixRange)) {
      attemptFix(problem);

      /*
       * The only time attemptFix will fail is if a previous fix was
       * applied which conflicts with it.  So we can mark this as true.
       */
      fixesWereApplied = true;
    }
    output += text.slice(Math.max(0, lastPos));

    return {
      fixed: fixesWereApplied,
      messages: remainingMessages.sort(compareMessagesByLocation),
      output,
    };
  }

  return {
    fixed: false,
    messages,
    output: bom + text,
  };
}
