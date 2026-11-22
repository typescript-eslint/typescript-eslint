import type { RuleModule } from '@typescript-eslint/utils/ts-eslint';

import { RuleTester } from '../src/RuleTester';

const createRule = (
  method: 'applyInlineConfig' | 'applyLanguageOptions' | 'finalize',
): RuleModule<never> => ({
  create: context => ({
    Program(): void {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.sourceCode as any)[method]({});
    },
  }),
  meta: { messages: {}, schema: [], type: 'problem' },
});

describe('forbidden SourceCode methods', () => {
  it.for(['applyInlineConfig', 'applyLanguageOptions', 'finalize'] as const)(
    'throws when a rule calls %s, every time',
    method => {
      const ruleTester = new RuleTester();
      const run = (): unknown =>
        // @ts-expect-error -- private
        ruleTester.runRuleForItem('rule', createRule(method), { code: 'a' });

      expect(run).toThrow(
        `\`SourceCode#${method}()\` cannot be called inside a rule.`,
      );
      expect(run).toThrow(
        `\`SourceCode#${method}()\` cannot be called inside a rule.`,
      );
    },
  );
});
