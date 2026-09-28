import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../../src/rules/prefer-optional-chain';
import { createRuleTesterWithTypes } from '../../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('prefer-optional-chain', rule, {
  valid: [
    noFormat`if (obj) (obj.method)();`,
    noFormat`if (obj) (obj.child).method();`,
    'if (obj) new obj.Constructor();',
    'if (obj) obj.method?.();',
    'if (obj) obj.child!.method();',
    {
      code: `
declare const value: string | undefined;
if (value) value.trim();
      `,
      options: [{ checkString: false }],
    },
    'if (callback) callbacks.push(callback);',
    `
if (callback) callback();
else other();
    `,
    `
if (callback) {
  callback();
  other();
}
    `,
    `
if (callback) {
}
    `,
    'if (callback) return callback();',
    'if (callback) callback = other;',
    'if (callback) callback?.();',
    `
if (callback) {
  /* keep */ callback();
}
    `,
    'if (/* keep */ callback) callback();',
    `
if (callback) {
  callback(); /* keep */
}
    `,
    'if (callback) other();',
    'if (getCallback()) getCallback()();',
    'if (list) list.length;',
    `
declare const callback: false | (() => void);
if (callback) callback();
    `,
    `
declare const value: '' | { run(): void };
if (value) value.run();
    `,
    { code: 'if (callback) callback();', options: [{ checkAny: false }] },
    {
      code: `
declare const callback: () => void;
if (callback) callback();
      `,
      options: [{ requireNullish: true }],
    },
  ],
  invalid: [
    {
      code: noFormat`if (callback) { callback(); }`,
      errors: [
        {
          column: 1,
          endColumn: 30,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `callback?.();`,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: noFormat`if (callback) callback()`,
      errors: [
        {
          column: 1,
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `callback?.();`,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: noFormat`if (list) { list.push(item); }`,
      errors: [
        {
          column: 1,
          endColumn: 31,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `list?.push(item);`,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: 'if (list) list[method](item);',
      errors: [
        {
          column: 1,
          endColumn: 30,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `list?.[method](item);`,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: 'if (obj.callback) obj.callback();',
      errors: [
        {
          column: 1,
          endColumn: 34,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `obj.callback?.();`,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: 'if (obj) obj.callback();',
      errors: [
        {
          column: 1,
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `obj?.callback();`,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: 'if (obj) obj.child.callback();',
      errors: [
        {
          column: 1,
          endColumn: 31,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `obj?.child.callback();`,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: 'if (callback) callback<T>();',
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `callback?.<T>();`,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: noFormat`if (callback) (callback)();`,
      errors: [
        {
          column: 1,
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `{ (callback)?.(); }`,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: noFormat`if (list) (list).push(item);`,
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `{ (list)?.push(item); }`,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: 'if (callback) callback(/* keep */);',
      errors: [
        {
          column: 1,
          endColumn: 36,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `callback?.(/* keep */);`,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: 'if (outer) if (callback) callback();',
      errors: [
        {
          column: 12,
          endColumn: 37,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `if (outer) callback?.();`,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: noFormat`declare const value: string | undefined; if (value) value.trim();`,
      errors: [
        {
          column: 42,
          endColumn: 66,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `declare const value: string | undefined; value?.trim();`,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: noFormat`declare const callback: (() => void) | undefined; if (callback) callback();`,
      errors: [
        {
          column: 51,
          endColumn: 76,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `declare const callback: (() => void) | undefined; callback?.();`,
            },
          ],
        },
      ],
      options: [{ requireNullish: true }],
      output: null,
    },
  ],
});
