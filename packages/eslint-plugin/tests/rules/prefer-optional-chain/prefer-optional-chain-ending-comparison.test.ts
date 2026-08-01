import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../../src/rules/prefer-optional-chain';
import { createRuleTesterParserOptions } from '../../RuleTester';

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: createRuleTesterParserOptions() },
});

ruleTester.run('prefer-optional-chain', rule, {
  invalid: [
    {
      code: 'foo && foo.bar == 0;',
      errors: [
        {
          column: 1,
          endColumn: 20,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar == 0;` },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar == 1;',
      errors: [
        {
          column: 1,
          endColumn: 20,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar == 1;` },
          ],
        },
      ],
    },
    {
      code: "foo && foo.bar == '123';",
      errors: [
        {
          column: 1,
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.bar == '123';`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar == {};',
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar == {};` },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar == false;',
      errors: [
        {
          column: 1,
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.bar == false;`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar == true;',
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.bar == true;`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar === 0;',
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar === 0;` },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar === 1;',
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar === 1;` },
          ],
        },
      ],
    },
    {
      code: "foo && foo.bar === '123';",
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
              output: `foo?.bar === '123';`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar === {};',
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar === {};` },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar === false;',
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
              output: `foo?.bar === false;`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar === true;',
      errors: [
        {
          column: 1,
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.bar === true;`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar === null;',
      errors: [
        {
          column: 1,
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.bar === null;`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar !== undefined;',
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
              output: `foo?.bar !== undefined;`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar != undefined;',
      errors: [
        {
          column: 1,
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `foo?.bar != undefined;`,
    },
    {
      code: 'foo && foo.bar != null;',
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `foo?.bar != null;`,
    },
    {
      code: 'foo != null && foo.bar == 0;',
      errors: [
        {
          column: 1,
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar == 0;` },
          ],
        },
      ],
    },
    {
      code: 'foo != null && foo.bar == 1;',
      errors: [
        {
          column: 1,
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar == 1;` },
          ],
        },
      ],
    },
    {
      code: "foo != null && foo.bar == '123';",
      errors: [
        {
          column: 1,
          endColumn: 32,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.bar == '123';`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo != null && foo.bar == {};',
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar == {};` },
          ],
        },
      ],
    },
    {
      code: 'foo != null && foo.bar == false;',
      errors: [
        {
          column: 1,
          endColumn: 32,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.bar == false;`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo != null && foo.bar == true;',
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
              output: `foo?.bar == true;`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo != null && foo.bar === 0;',
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar === 0;` },
          ],
        },
      ],
    },
    {
      code: 'foo != null && foo.bar === 1;',
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar === 1;` },
          ],
        },
      ],
    },
    {
      code: "foo != null && foo.bar === '123';",
      errors: [
        {
          column: 1,
          endColumn: 33,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.bar === '123';`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo != null && foo.bar === {};',
      errors: [
        {
          column: 1,
          endColumn: 30,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar === {};` },
          ],
        },
      ],
    },
    {
      code: 'foo != null && foo.bar === false;',
      errors: [
        {
          column: 1,
          endColumn: 33,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.bar === false;`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo != null && foo.bar === true;',
      errors: [
        {
          column: 1,
          endColumn: 32,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.bar === true;`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo != null && foo.bar === null;',
      errors: [
        {
          column: 1,
          endColumn: 32,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.bar === null;`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo != null && foo.bar !== undefined;',
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.bar !== undefined;`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo != null && foo.bar != undefined;',
      errors: [
        {
          column: 1,
          endColumn: 36,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `foo?.bar != undefined;`,
    },
    {
      code: 'foo != null && foo.bar != null;',
      errors: [
        {
          column: 1,
          endColumn: 31,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `foo?.bar != null;`,
    },
    {
      code: `
declare const foo: { bar: number };
foo && foo.bar != null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: number };
foo?.bar != null;
      `,
    },
    {
      code: `
declare const foo: { bar: number };
foo != null && foo.bar != null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 31,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: number };
foo?.bar != null;
      `,
    },
    {
      code: '!foo || foo.bar != 0;',
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar != 0;` },
          ],
        },
      ],
    },
    {
      code: '!foo || foo.bar != 1;',
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar != 1;` },
          ],
        },
      ],
    },
    {
      code: "!foo || foo.bar != '123';",
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
              output: `foo?.bar != '123';`,
            },
          ],
        },
      ],
    },
    {
      code: '!foo || foo.bar != {};',
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar != {};` },
          ],
        },
      ],
    },
    {
      code: '!foo || foo.bar != false;',
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
              output: `foo?.bar != false;`,
            },
          ],
        },
      ],
    },
    {
      code: '!foo || foo.bar != true;',
      errors: [
        {
          column: 1,
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.bar != true;`,
            },
          ],
        },
      ],
    },
    {
      code: '!foo || foo.bar === undefined;',
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
              output: `foo?.bar === undefined;`,
            },
          ],
        },
      ],
    },
    {
      code: '!foo || foo.bar == undefined;',
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `foo?.bar == undefined;`,
    },
    {
      code: '!foo || foo.bar == null;',
      errors: [
        {
          column: 1,
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `foo?.bar == null;`,
    },
    {
      code: '!foo || foo.bar !== 0;',
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar !== 0;` },
          ],
        },
      ],
    },
    {
      code: '!foo || foo.bar !== 1;',
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar !== 1;` },
          ],
        },
      ],
    },
    {
      code: "!foo || foo.bar !== '123';",
      errors: [
        {
          column: 1,
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.bar !== '123';`,
            },
          ],
        },
      ],
    },
    {
      code: '!foo || foo.bar !== {};',
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar !== {};` },
          ],
        },
      ],
    },
    {
      code: '!foo || foo.bar !== false;',
      errors: [
        {
          column: 1,
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.bar !== false;`,
            },
          ],
        },
      ],
    },
    {
      code: '!foo || foo.bar !== true;',
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
              output: `foo?.bar !== true;`,
            },
          ],
        },
      ],
    },
    {
      code: '!foo || foo.bar !== null;',
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
              output: `foo?.bar !== null;`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo == null || foo.bar != 0;',
      errors: [
        {
          column: 1,
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar != 0;` },
          ],
        },
      ],
    },
    {
      code: 'foo == null || foo.bar != 1;',
      errors: [
        {
          column: 1,
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar != 1;` },
          ],
        },
      ],
    },
    {
      code: "foo == null || foo.bar != '123';",
      errors: [
        {
          column: 1,
          endColumn: 32,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.bar != '123';`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo == null || foo.bar != {};',
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar != {};` },
          ],
        },
      ],
    },
    {
      code: 'foo == null || foo.bar != false;',
      errors: [
        {
          column: 1,
          endColumn: 32,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.bar != false;`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo == null || foo.bar != true;',
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
              output: `foo?.bar != true;`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo == null || foo.bar === undefined;',
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.bar === undefined;`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo == null || foo.bar == undefined;',
      errors: [
        {
          column: 1,
          endColumn: 36,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `foo?.bar == undefined;`,
    },
    {
      code: 'foo == null || foo.bar == null;',
      errors: [
        {
          column: 1,
          endColumn: 31,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `foo?.bar == null;`,
    },
    {
      code: 'foo == null || foo.bar !== 0;',
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar !== 0;` },
          ],
        },
      ],
    },
    {
      code: 'foo == null || foo.bar !== 1;',
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar !== 1;` },
          ],
        },
      ],
    },
    {
      code: "foo == null || foo.bar !== '123';",
      errors: [
        {
          column: 1,
          endColumn: 33,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.bar !== '123';`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo == null || foo.bar !== {};',
      errors: [
        {
          column: 1,
          endColumn: 30,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: `foo?.bar !== {};` },
          ],
        },
      ],
    },
    {
      code: 'foo == null || foo.bar !== false;',
      errors: [
        {
          column: 1,
          endColumn: 33,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.bar !== false;`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo == null || foo.bar !== true;',
      errors: [
        {
          column: 1,
          endColumn: 32,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.bar !== true;`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo == null || foo.bar !== null;',
      errors: [
        {
          column: 1,
          endColumn: 32,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.bar !== null;`,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const foo: { bar: number };
!foo || foo.bar == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: number };
foo?.bar == null;
      `,
    },
    {
      code: `
declare const foo: { bar: number };
!foo || foo.bar == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: number };
foo?.bar == undefined;
      `,
    },
    {
      code: `
declare const foo: { bar: number };
!foo || foo.bar === undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 30,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: number };
foo?.bar === undefined;
      `,
    },
    {
      code: `
declare const foo: { bar: number };
!foo || foo.bar !== 0;
      `,
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: number };
foo?.bar !== 0;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const foo: { bar: number };
!foo || foo.bar !== 1;
      `,
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: number };
foo?.bar !== 1;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const foo: { bar: number };
!foo || foo.bar !== '123';
      `,
      errors: [
        {
          column: 1,
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: number };
foo?.bar !== '123';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const foo: { bar: number };
!foo || foo.bar !== {};
      `,
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: number };
foo?.bar !== {};
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const foo: { bar: number };
!foo || foo.bar !== false;
      `,
      errors: [
        {
          column: 1,
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: number };
foo?.bar !== false;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const foo: { bar: number };
!foo || foo.bar !== true;
      `,
      errors: [
        {
          column: 1,
          endColumn: 25,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: number };
foo?.bar !== true;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const foo: { bar: number };
!foo || foo.bar !== null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 25,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: number };
foo?.bar !== null;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const foo: { bar: number };
!foo || foo.bar != 0;
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: number };
foo?.bar != 0;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const foo: { bar: number };
!foo || foo.bar != 1;
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: number };
foo?.bar != 1;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const foo: { bar: number };
!foo || foo.bar != '123';
      `,
      errors: [
        {
          column: 1,
          endColumn: 25,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: number };
foo?.bar != '123';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const foo: { bar: number };
!foo || foo.bar != {};
      `,
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: number };
foo?.bar != {};
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const foo: { bar: number };
!foo || foo.bar != false;
      `,
      errors: [
        {
          column: 1,
          endColumn: 25,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: number };
foo?.bar != false;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const foo: { bar: number };
!foo || foo.bar != true;
      `,
      errors: [
        {
          column: 1,
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: number };
foo?.bar != true;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const foo: { bar: number };
foo == null || foo.bar == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 31,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: number };
foo?.bar == null;
      `,
    },
    {
      code: `
declare const foo: { bar: number };
foo == null || foo.bar == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 36,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: number };
foo?.bar == undefined;
      `,
    },
    {
      code: `
declare const foo: { bar: number };
foo == null || foo.bar === undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: number };
foo?.bar === undefined;
      `,
    },
    {
      code: `
declare const foo: { bar: number };
foo == null || foo.bar !== 0;
      `,
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: number };
foo?.bar !== 0;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const foo: { bar: number };
foo == null || foo.bar !== 1;
      `,
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: number };
foo?.bar !== 1;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const foo: { bar: number };
foo == null || foo.bar !== '123';
      `,
      errors: [
        {
          column: 1,
          endColumn: 33,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: number };
foo?.bar !== '123';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const foo: { bar: number };
foo == null || foo.bar !== {};
      `,
      errors: [
        {
          column: 1,
          endColumn: 30,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: number };
foo?.bar !== {};
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const foo: { bar: number };
foo == null || foo.bar !== false;
      `,
      errors: [
        {
          column: 1,
          endColumn: 33,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: number };
foo?.bar !== false;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const foo: { bar: number };
foo == null || foo.bar !== true;
      `,
      errors: [
        {
          column: 1,
          endColumn: 32,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: number };
foo?.bar !== true;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const foo: { bar: number };
foo == null || foo.bar !== null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 32,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: number };
foo?.bar !== null;
      `,
            },
          ],
        },
      ],
    },
    // yoda case
    {
      code: "foo != null && null != foo.bar && '123' == foo.bar.baz;",
      errors: [
        {
          column: 1,
          endColumn: 55,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `'123' == foo?.bar?.baz;`,
            },
          ],
        },
      ],
    },
    {
      code: "foo != null && null != foo.bar && '123' === foo.bar.baz;",
      errors: [
        {
          column: 1,
          endColumn: 56,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `'123' === foo?.bar?.baz;`,
            },
          ],
        },
      ],
    },
    {
      code: 'foo != null && null != foo.bar && undefined !== foo.bar.baz;',
      errors: [
        {
          column: 1,
          endColumn: 60,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `undefined !== foo?.bar?.baz;`,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const a: { b: number } | null;
declare const foo: { three: 3 };
a != null && a.b === foo.three;
      `,
      errors: [
        {
          column: 1,
          endColumn: 31,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const a: { b: number } | null;
declare const foo: { three: 3 };
a?.b === foo.three;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const a: { b: () => number } | null;
declare const foo: { three: 3 };
a != null && a.b() === foo.three;
      `,
      errors: [
        {
          column: 1,
          endColumn: 33,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const a: { b: () => number } | null;
declare const foo: { three: 3 };
a?.b() === foo.three;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const a: { b: number } | null;
declare const foo: { three: 3 };
a != null && a.b == foo.three;
      `,
      errors: [
        {
          column: 1,
          endColumn: 30,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const a: { b: number } | null;
declare const foo: { three: 3 };
a?.b == foo.three;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const a: { b: () => number } | null;
declare const foo: { three: 3 };
a != null && a.b() == foo.three;
      `,
      errors: [
        {
          column: 1,
          endColumn: 32,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const a: { b: () => number } | null;
declare const foo: { three: 3 };
a?.b() == foo.three;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const a: { b: number } | null;
declare const foo: { three: undefined };
a != null && a.b !== foo.three;
      `,
      errors: [
        {
          column: 1,
          endColumn: 31,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const a: { b: number } | null;
declare const foo: { three: undefined };
a?.b !== foo.three;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const a: { b: () => number } | null;
declare const foo: { three: undefined };
a != null && a.b() != foo.three;
      `,
      errors: [
        {
          column: 1,
          endColumn: 32,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const a: { b: () => number } | null;
declare const foo: { three: undefined };
a?.b() != foo.three;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const a: { b: number } | null;
declare const foo: { three: 3 };
a === null || a.b !== foo.three;
      `,
      errors: [
        {
          column: 1,
          endColumn: 32,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const a: { b: number } | null;
declare const foo: { three: 3 };
a?.b !== foo.three;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const a: { b: () => number } | null;
declare const foo: { three: 3 };
a === null || a.b() != foo.three;
      `,
      errors: [
        {
          column: 1,
          endColumn: 33,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const a: { b: () => number } | null;
declare const foo: { three: 3 };
a?.b() != foo.three;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const a: { b: number } | null;
declare const foo: { three: undefined };
a === null || a.b == foo.three;
      `,
      errors: [
        {
          column: 1,
          endColumn: 31,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const a: { b: number } | null;
declare const foo: { three: undefined };
a?.b == foo.three;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const a: { b: () => number } | null;
declare const foo: { three: undefined };
a === null || a.b() === foo.three;
      `,
      errors: [
        {
          column: 1,
          endColumn: 34,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const a: { b: () => number } | null;
declare const foo: { three: undefined };
a?.b() === foo.three;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const a: { b: number } | null;
declare const foo: { three: 3 };
a != null && foo.three === a.b;
      `,
      errors: [
        {
          column: 1,
          endColumn: 31,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const a: { b: number } | null;
declare const foo: { three: 3 };
foo.three === a?.b;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const a: { b: () => number } | null;
declare const foo: { three: 3 };
a != null && foo.three === a.b();
      `,
      errors: [
        {
          column: 1,
          endColumn: 33,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const a: { b: () => number } | null;
declare const foo: { three: 3 };
foo.three === a?.b();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const a: { b: number } | null;
declare const foo: { three: 3 };
a != null && foo.three == a.b;
      `,
      errors: [
        {
          column: 1,
          endColumn: 30,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const a: { b: number } | null;
declare const foo: { three: 3 };
foo.three == a?.b;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const a: { b: () => number } | null;
declare const foo: { three: 3 };
a != null && foo.three == a.b();
      `,
      errors: [
        {
          column: 1,
          endColumn: 32,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const a: { b: () => number } | null;
declare const foo: { three: 3 };
foo.three == a?.b();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const a: { b: number } | null;
declare const foo: { three: undefined };
a != null && foo.three !== a.b;
      `,
      errors: [
        {
          column: 1,
          endColumn: 31,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const a: { b: number } | null;
declare const foo: { three: undefined };
foo.three !== a?.b;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const a: { b: () => number } | null;
declare const foo: { three: undefined };
a != null && foo.three != a.b();
      `,
      errors: [
        {
          column: 1,
          endColumn: 32,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const a: { b: () => number } | null;
declare const foo: { three: undefined };
foo.three != a?.b();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const a: { b: number } | null;
declare const foo: { three: 3 };
a == null || foo.three !== a.b;
      `,
      errors: [
        {
          column: 1,
          endColumn: 31,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const a: { b: number } | null;
declare const foo: { three: 3 };
foo.three !== a?.b;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
type Branch = { id: string } & { name: string };
declare const a: Branch | null;
declare const b: Branch;
!a || b.id !== a.id;
      `,
      errors: [
        {
          column: 1,
          endColumn: 20,
          endLine: 5,
          line: 5,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
type Branch = { id: string } & { name: string };
declare const a: Branch | null;
declare const b: Branch;
b.id !== a?.id;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const a: { b: () => number } | null;
declare const foo: { three: 3 };
a == null || foo.three != a.b();
      `,
      errors: [
        {
          column: 1,
          endColumn: 32,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const a: { b: () => number } | null;
declare const foo: { three: 3 };
foo.three != a?.b();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const a: { b: number } | null;
declare const foo: { three: undefined };
a == null || foo.three == a.b;
      `,
      errors: [
        {
          column: 1,
          endColumn: 30,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const a: { b: number } | null;
declare const foo: { three: undefined };
foo.three == a?.b;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const a: { b: () => number } | null;
declare const foo: { three: undefined };
a == null || foo.three === a.b();
      `,
      errors: [
        {
          column: 1,
          endColumn: 33,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const a: { b: () => number } | null;
declare const foo: { three: undefined };
foo.three === a?.b();
      `,
            },
          ],
        },
      ],
    },
    {
      code: noFormat`foo && (foo.bar == 0)`,
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: 'foo?.bar == 0' },
          ],
        },
      ],
    },
  ],
  valid: [
    'foo && foo.bar == undeclaredVar;',
    'foo && foo.bar == null;',
    'foo && foo.bar == undefined;',
    'foo && foo.bar === undeclaredVar;',
    'foo && foo.bar === undefined;',
    'foo && foo.bar === too.bar;',
    'foo && foo.bar === foo.baz;',
    'foo && foo.bar !== 0;',
    'foo && foo.bar !== 1;',
    "foo && foo.bar !== '123';",
    'foo && foo.bar !== {};',
    'foo && foo.bar !== false;',
    'foo && foo.bar !== true;',
    'foo && foo.bar !== null;',
    'foo && foo.bar !== undeclaredVar;',
    'foo && foo.bar !== too.bar;',
    'foo && foo.bar !== foo.baz;',
    'foo && foo.bar != 0;',
    'foo && foo.bar != 1;',
    "foo && foo.bar != '123';",
    'foo && foo.bar != {};',
    'foo && foo.bar != false;',
    'foo && foo.bar != true;',
    'foo && foo.bar != undeclaredVar;',
    'foo && foo.bar != too.bar;',
    'foo && foo.bar != foo.baz;',
    'foo != null && foo.bar == undeclaredVar;',
    'foo != null && foo.bar == null;',
    'foo != null && foo.bar == undefined;',
    'foo != null && foo.bar === undeclaredVar;',
    'foo != null && foo.bar === undefined;',
    'foo != null && foo.bar !== 0;',
    'foo != null && foo.bar !== 1;',
    "foo != null && foo.bar !== '123';",
    'foo != null && foo.bar !== {};',
    'foo != null && foo.bar !== false;',
    'foo != null && foo.bar !== true;',
    'foo != null && foo.bar !== null;',
    'foo != null && foo.bar !== undeclaredVar;',
    'foo != null && foo.bar != 0;',
    'foo != null && foo.bar != 1;',
    "foo != null && foo.bar != '123';",
    'foo != null && foo.bar != {};',
    'foo != null && foo.bar != false;',
    'foo != null && foo.bar != true;',
    'foo != null && foo.bar != undeclaredVar;',
    `
declare const foo: { bar: number; baz: number } | null;
foo != null && foo.bar == foo.baz;
    `,
    `
declare const foo: { bar: number; baz: () => number } | null;
foo != null && foo.bar == foo.baz();
    `,
    `
declare const foo: { bar: number; baz: number } | null;
foo != null && foo.bar === foo.baz;
    `,
    `
declare const foo: { bar: number; baz: () => number } | null;
foo != null && foo.bar === foo.baz();
    `,
    `
declare const foo: { bar: number; baz: undefined } | null;
foo != null && foo.bar != foo.baz;
    `,
    `
declare const foo: { bar: number; baz: () => undefined } | null;
foo != null && foo.bar != foo.baz();
    `,
    `
declare const foo: { bar: number; baz: undefined } | null;
foo != null && foo.bar !== foo.baz;
    `,
    `
declare const foo: { bar: number; baz: () => undefined } | null;
foo != null && foo.bar !== foo.baz();
    `,
    `
declare const foo: { bar: number };
foo && foo.bar == undeclaredVar;
    `,
    `
declare const foo: { bar: number };
foo && foo.bar == null;
    `,
    `
declare const foo: { bar: number };
foo && foo.bar == undefined;
    `,
    `
declare const foo: { bar: number };
foo && foo.bar === undeclaredVar;
    `,
    `
declare const foo: { bar: number };
foo && foo.bar === undefined;
    `,
    `
declare const foo: { bar: number };
foo && foo.bar !== 0;
    `,
    `
declare const foo: { bar: number };
foo && foo.bar !== 1;
    `,
    `
declare const foo: { bar: number };
foo && foo.bar !== '123';
    `,
    `
declare const foo: { bar: number };
foo && foo.bar !== {};
    `,
    `
declare const foo: { bar: number };
foo && foo.bar !== false;
    `,
    `
declare const foo: { bar: number };
foo && foo.bar !== true;
    `,
    `
declare const foo: { bar: number };
foo && foo.bar !== null;
    `,
    `
declare const foo: { bar: number };
foo && foo.bar !== undeclaredVar;
    `,
    `
declare const foo: { bar: number };
foo && foo.bar != 0;
    `,
    `
declare const foo: { bar: number };
foo && foo.bar != 1;
    `,
    `
declare const foo: { bar: number };
foo && foo.bar != '123';
    `,
    `
declare const foo: { bar: number };
foo && foo.bar != {};
    `,
    `
declare const foo: { bar: number };
foo && foo.bar != false;
    `,
    `
declare const foo: { bar: number };
foo && foo.bar != true;
    `,
    `
declare const foo: { bar: number };
foo && foo.bar != undeclaredVar;
    `,
    `
declare const foo: { bar: number };
foo != null && foo.bar == undeclaredVar;
    `,
    `
declare const foo: { bar: number };
foo != null && foo.bar == null;
    `,
    `
declare const foo: { bar: number };
foo != null && foo.bar == undefined;
    `,
    `
declare const foo: { bar: number };
foo != null && foo.bar === undeclaredVar;
    `,
    `
declare const foo: { bar: number };
foo != null && foo.bar === undefined;
    `,
    `
declare const foo: { bar: number };
foo != null && foo.bar !== 0;
    `,
    `
declare const foo: { bar: number };
foo != null && foo.bar !== 1;
    `,
    `
declare const foo: { bar: number };
foo != null && foo.bar !== '123';
    `,
    `
declare const foo: { bar: number };
foo != null && foo.bar !== {};
    `,
    `
declare const foo: { bar: number };
foo != null && foo.bar !== false;
    `,
    `
declare const foo: { bar: number };
foo != null && foo.bar !== true;
    `,
    `
declare const foo: { bar: number };
foo != null && foo.bar !== null;
    `,
    `
declare const foo: { bar: number };
foo != null && foo.bar !== undeclaredVar;
    `,
    `
declare const foo: { bar: number };
foo != null && foo.bar != 0;
    `,
    `
declare const foo: { bar: number };
foo != null && foo.bar != 1;
    `,
    `
declare const foo: { bar: number };
foo != null && foo.bar != '123';
    `,
    `
declare const foo: { bar: number };
foo != null && foo.bar != {};
    `,
    `
declare const foo: { bar: number };
foo != null && foo.bar != false;
    `,
    `
declare const foo: { bar: number };
foo != null && foo.bar != true;
    `,
    `
declare const foo: { bar: number };
foo != null && foo.bar != undeclaredVar;
    `,
    `
declare const foo: { bar: number } | 1;
foo && foo.bar == undeclaredVar;
    `,
    `
declare const foo: { bar: number } | 0;
foo != null && foo.bar == undeclaredVar;
    `,
    `
declare const foo: { bar: number } | null;
foo && foo.bar == undeclaredVar;
    `,
    `
declare const foo: { bar: number } | null;
foo && foo.bar == null;
    `,
    `
declare const foo: { bar: number } | null;
foo && foo.bar == undefined;
    `,
    `
declare const foo: { bar: number } | null;
foo && foo.bar === undeclaredVar;
    `,
    `
declare const foo: { bar: number } | null;
foo && foo.bar === undefined;
    `,
    `
declare const foo: { bar: number } | null;
foo && foo.bar !== 0;
    `,
    `
declare const foo: { bar: number } | null;
foo && foo.bar !== 1;
    `,
    `
declare const foo: { bar: number } | null;
foo && foo.bar !== '123';
    `,
    `
declare const foo: { bar: number } | null;
foo && foo.bar !== {};
    `,
    `
declare const foo: { bar: number } | null;
foo && foo.bar !== false;
    `,
    `
declare const foo: { bar: number } | null;
foo && foo.bar !== true;
    `,
    `
declare const foo: { bar: number } | null;
foo && foo.bar !== null;
    `,
    `
declare const foo: { bar: number } | null;
foo && foo.bar !== undeclaredVar;
    `,
    `
declare const foo: { bar: number } | null;
foo != null && foo.bar == undeclaredVar;
    `,
    `
declare const foo: { bar: number } | null;
foo != null && foo.bar == null;
    `,
    `
declare const foo: { bar: number } | null;
foo != null && foo.bar == undefined;
    `,
    `
declare const foo: { bar: number } | null;
foo != null && foo.bar === undeclaredVar;
    `,
    `
declare const foo: { bar: number } | null;
foo != null && foo.bar === undefined;
    `,
    `
declare const foo: { bar: number } | null;
foo != null && foo.bar !== 0;
    `,
    `
declare const foo: { bar: number } | null;
foo != null && foo.bar !== 1;
    `,
    `
declare const foo: { bar: number } | null;
foo != null && foo.bar !== '123';
    `,
    `
declare const foo: { bar: number } | null;
foo != null && foo.bar !== {};
    `,
    `
declare const foo: { bar: number } | null;
foo != null && foo.bar !== false;
    `,
    `
declare const foo: { bar: number } | null;
foo != null && foo.bar !== true;
    `,
    `
declare const foo: { bar: number } | null;
foo != null && foo.bar !== null;
    `,
    `
declare const foo: { bar: number } | null;
foo != null && foo.bar !== undeclaredVar;
    `,
    `
declare const foo: { bar: number } | null;
foo !== null && foo !== undefined && foo.bar == null;
    `,
    `
declare const foo: { bar: number } | null;
foo !== null && foo !== undefined && foo.bar === undefined;
    `,
    `
declare const foo: { bar: number } | null;
foo !== null && foo !== undefined && foo.bar !== 1;
    `,
    `
declare const foo: { bar: number } | null;
foo !== null && foo !== undefined && foo.bar != 1;
    `,

    `
declare const foo: { bar: number } | undefined;
foo !== null && foo !== undefined && foo.bar == null;
    `,
    `
declare const foo: { bar: number } | undefined;
foo !== null && foo !== undefined && foo.bar === undefined;
    `,
    `
declare const foo: { bar: number } | undefined;
foo !== null && foo !== undefined && foo.bar !== 1;
    `,
    `
declare const foo: { bar: number } | undefined;
foo !== null && foo !== undefined && foo.bar != 1;
    `,
    `
declare const foo: { bar: number } | null;
foo !== undefined && foo !== undefined && foo.bar == null;
    `,
    `
declare const foo: { bar: number } | null;
foo !== undefined && foo !== undefined && foo.bar === undefined;
    `,
    `
declare const foo: { bar: number } | null;
foo !== undefined && foo !== undefined && foo.bar !== 1;
    `,
    `
declare const foo: { bar: number } | null;
foo !== undefined && foo !== undefined && foo.bar != 1;
    `,

    `
declare const foo: { bar: number } | undefined;
foo !== undefined && foo !== undefined && foo.bar == null;
    `,
    `
declare const foo: { bar: number } | undefined;
foo !== undefined && foo !== undefined && foo.bar === undefined;
    `,
    `
declare const foo: { bar: number } | undefined;
foo !== undefined && foo !== undefined && foo.bar !== 1;
    `,
    `
declare const foo: { bar: number } | undefined;
foo !== undefined && foo !== undefined && foo.bar != 1;
    `,
    `
declare const foo: { bar: number };
!foo || foo.bar == undeclaredVar;
    `,
    `
declare const foo: { bar: number };
!foo || foo.bar === undeclaredVar;
    `,
    `
declare const foo: { bar: number };
!foo || foo.bar !== undeclaredVar;
    `,
    `
declare const foo: { bar: number };
!foo || foo.bar != null;
    `,
    `
declare const foo: { bar: number };
!foo || foo.bar != undeclaredVar;
    `,
    '!foo && foo.bar == 0;',
    '!foo && foo.bar == 1;',
    "!foo && foo.bar == '123';",
    '!foo && foo.bar == {};',
    '!foo && foo.bar == false;',
    '!foo && foo.bar == true;',
    '!foo && foo.bar === 0;',
    '!foo && foo.bar === 1;',
    "!foo && foo.bar === '123';",
    '!foo && foo.bar === {};',
    '!foo && foo.bar === false;',
    '!foo && foo.bar === true;',
    '!foo && foo.bar === null;',
    '!foo && foo.bar !== undefined;',
    '!foo && foo.bar != undefined;',
    '!foo && foo.bar != null;',
    'foo == null && foo.bar == 0;',
    'foo == null && foo.bar == 1;',
    "foo == null && foo.bar == '123';",
    'foo == null && foo.bar == {};',
    'foo == null && foo.bar == false;',
    'foo == null && foo.bar == true;',
    'foo == null && foo.bar === 0;',
    'foo == null && foo.bar === 1;',
    "foo == null && foo.bar === '123';",
    'foo == null && foo.bar === {};',
    'foo == null && foo.bar === false;',
    'foo == null && foo.bar === true;',
    'foo == null && foo.bar === null;',
    'foo == null && foo.bar !== undefined;',
    'foo == null && foo.bar != null;',
    'foo == null && foo.bar != undefined;',
    `
declare const foo: false | { a: string };
foo && foo.a == undeclaredVar;
    `,
    `
declare const foo: '' | { a: string };
foo && foo.a == undeclaredVar;
    `,
    `
declare const foo: 0 | { a: string };
foo && foo.a == undeclaredVar;
    `,
    `
declare const foo: 0n | { a: string };
foo && foo.a;
    `,
    '!foo || foo.bar != undeclaredVar;',
    '!foo || foo.bar != null;',
    '!foo || foo.bar != undefined;',
    '!foo || foo.bar === 0;',
    '!foo || foo.bar === 1;',
    "!foo || foo.bar === '123';",
    '!foo || foo.bar === {};',
    '!foo || foo.bar === false;',
    '!foo || foo.bar === true;',
    '!foo || foo.bar === null;',
    '!foo || foo.bar === undeclaredVar;',
    '!foo || foo.bar == 0;',
    '!foo || foo.bar == 1;',
    "!foo || foo.bar == '123';",
    '!foo || foo.bar == {};',
    '!foo || foo.bar == false;',
    '!foo || foo.bar == true;',
    '!foo || foo.bar == undeclaredVar;',
    '!foo || foo.bar !== undeclaredVar;',
    '!foo || foo.bar !== undefined;',
    `
declare const foo: { bar: number };
foo == null || foo.bar == undeclaredVar;
    `,
    `
declare const foo: { bar: number };
foo == null || foo.bar === undeclaredVar;
    `,
    `
declare const foo: { bar: number };
foo == null || foo.bar !== undeclaredVar;
    `,
    'foo == null || foo.bar != undeclaredVar;',
    'foo == null || foo.bar != null;',
    'foo == null || foo.bar != undefined;',
    'foo == null || foo.bar === 0;',
    'foo == null || foo.bar === 1;',
    "foo == null || foo.bar === '123';",
    'foo == null || foo.bar === {};',
    'foo == null || foo.bar === false;',
    'foo == null || foo.bar === true;',
    'foo == null || foo.bar === null;',
    'foo == null || foo.bar === undeclaredVar;',
    'foo == null || foo.bar == 0;',
    'foo == null || foo.bar == 1;',
    "foo == null || foo.bar == '123';",
    'foo == null || foo.bar == {};',
    'foo == null || foo.bar == false;',
    'foo == null || foo.bar == true;',
    'foo == null || foo.bar == undeclaredVar;',
    'foo == null || foo.bar !== undeclaredVar;',
    'foo == null || foo.bar !== undefined;',
    `
declare const foo: { bar: number; baz: number } | null;
foo == null || foo.bar != foo.baz;
    `,
    `
declare const foo: { bar: number; baz: () => number } | null;
foo == null || foo.bar != foo.baz();
    `,
    `
declare const foo: { bar: number; baz: undefined } | null;
foo == null || foo.bar === foo.baz;
    `,
    `
declare const foo: { bar: number; baz: () => undefined } | null;
foo == null || foo.bar === foo.baz();
    `,
    `
declare const foo: { bar: number; baz: undefined } | null;
foo == null || foo.bar == foo.baz;
    `,
    `
declare const foo: { bar: number; baz: () => undefined } | null;
foo == null || foo.bar == foo.baz();
    `,
    `
declare const foo: { bar: number; baz: number } | null;
foo == null || foo.bar !== foo.baz;
    `,
    `
declare const foo: { bar: number; baz: () => number } | null;
foo == null || foo.bar !== foo.baz();
    `,
    'foo || foo.bar != 0;',
    'foo || foo.bar != 1;',
    "foo || foo.bar != '123';",
    'foo || foo.bar != {};',
    'foo || foo.bar != false;',
    'foo || foo.bar != true;',
    'foo || foo.bar === undefined;',
    'foo || foo.bar == undefined;',
    'foo || foo.bar == null;',
    'foo || foo.bar !== 0;',
    'foo || foo.bar !== 1;',
    "foo || foo.bar !== '123';",
    'foo || foo.bar !== {};',
    'foo || foo.bar !== false;',
    'foo || foo.bar !== true;',
    'foo || foo.bar !== null;',
    'foo != null || foo.bar != 0;',
    'foo != null || foo.bar != 1;',
    "foo != null || foo.bar != '123';",
    'foo != null || foo.bar != {};',
    'foo != null || foo.bar != false;',
    'foo != null || foo.bar != true;',
    'foo != null || foo.bar === undefined;',
    'foo != null || foo.bar == undefined;',
    'foo != null || foo.bar == null;',
    'foo != null || foo.bar !== 0;',
    'foo != null || foo.bar !== 1;',
    "foo != null || foo.bar !== '123';",
    'foo != null || foo.bar !== {};',
    'foo != null || foo.bar !== false;',
    'foo != null || foo.bar !== true;',
    'foo != null || foo.bar !== null;',
    `
declare const record: Record<string, { kind: string }>;
record['key'] && record['key'].kind !== '1';
    `,
    `
declare const array: { b?: string }[];
!array[1] || array[1].b === 'foo';
    `,
  ],
});
