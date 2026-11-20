import { AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

// tslint regex
// https://github.com/palantir/tslint/blob/95d9d958833fd9dc0002d18cbe34db20d0fbf437/src/enableDisableRules.ts#L32
const ENABLE_DISABLE_REGEX =
  /^\s*tslint:(enable|disable)(?:-(line|next-line))?(:|\s|$)/;

const toText = (
  text: string,
  type: AST_TOKEN_TYPES.Block | AST_TOKEN_TYPES.Line,
): string =>
  type === AST_TOKEN_TYPES.Line
    ? ['//', text.trim()].join(' ')
    : ['/*', text.trim(), '*/'].join(' ');

export default createRule({
  name: 'ban-tslint-comment',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow `// tslint:<rule-flag>` comments',
      recommended: 'stylistic',
    },
    fixable: 'code',
    messages: {
      commentDetected: 'tslint comment detected: "{{ text }}"',
    },
    schema: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],
  create: context => {
    return {
      Program(): void {
        const comments = context.sourceCode.getAllComments();
        comments.forEach(c => {
          if (ENABLE_DISABLE_REGEX.test(c.value)) {
            context.report({
              node: c,
              messageId: 'commentDetected',
              data: { text: toText(c.value, c.type) },
              fix(fixer) {
                const { lines } = context.sourceCode;
                const textBefore = lines[c.loc.start.line - 1].slice(
                  0,
                  c.loc.start.column,
                );
                const textAfter = lines[c.loc.end.line - 1].slice(
                  c.loc.end.column,
                );
                const spacesBefore =
                  textBefore.length - textBefore.trimEnd().length;
                const spacesAfter =
                  textAfter.length - textAfter.trimStart().length;

                if (!textBefore.trim() && !textAfter.trim()) {
                  // The comment is alone on its line(s), so remove the line(s)
                  return fixer.removeRange([
                    c.range[0] - spacesBefore,
                    c.loc.end.line < lines.length
                      ? context.sourceCode.getIndexFromLoc({
                          column: 0,
                          line: c.loc.end.line + 1,
                        })
                      : c.range[1] + spacesAfter,
                  ]);
                }

                if (!textBefore.trim()) {
                  return fixer.removeRange([
                    c.range[0],
                    c.range[1] + spacesAfter,
                  ]);
                }

                if (!textAfter.trim()) {
                  return fixer.removeRange([
                    c.range[0] - spacesBefore,
                    c.range[1],
                  ]);
                }

                // Keep the code on either side from joining into one token
                return fixer.replaceTextRange(
                  [c.range[0] - spacesBefore, c.range[1] + spacesAfter],
                  ' ',
                );
              },
            });
          }
        });
      },
    };
  },
});
