import { AST_TOKEN_TYPES } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

// tslint regex
// https://github.com/palantir/tslint/blob/95d9d958833fd9dc0002d18cbe34db20d0fbf437/src/enableDisableRules.ts#L32
const ENABLE_DISABLE_REGEX = /^\s*tslint:(enable|disable)(?:-(line|next-line))?(:|\s|$)/;

const toText = (
  text: string,
  type: AST_TOKEN_TYPES.Line | AST_TOKEN_TYPES.Block,
): string =>
  type === AST_TOKEN_TYPES.Line
    ? ['//', text.trim()].join(' ')
    : ['/*', text.trim(), '*/'].join(' ');

export default util.createRule({
  name: 'ban-tslint-comment',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Bans `// tslint:<rule-flag>` comments from being used',
      category: 'Stylistic Issues',
      recommended: false,
    },
    messages: {
      commentDetected: 'tslint comment detected: "{{ text }}"',
    },
    schema: [],
    fixable: 'code',
  },
  defaultOptions: [],
  create: context => {
    const sourceCode = context.getSourceCode();
    return {
      Program(): void {
        const comments = sourceCode.getAllComments();
        comments.forEach(c => {
          if (ENABLE_DISABLE_REGEX.test(c.value)) {
            context.report({
              data: { text: toText(c.value, c.type) },
              node: c,
              messageId: 'commentDetected',
              fix(fixer) {
                const rangeStart = sourceCode.getIndexFromLoc({
                  column: c.loc.start.column > 0 ? c.loc.start.column - 1 : 0,
                  line: c.loc.start.line,
                });
                const rangeEnd = sourceCode.getIndexFromLoc({
                  column: c.loc.end.column,
                  line: c.loc.end.line,
                });
                return fixer.removeRange([rangeStart, rangeEnd + 1]);
              },
            });
          }
        });
      },
    };
  },
});
