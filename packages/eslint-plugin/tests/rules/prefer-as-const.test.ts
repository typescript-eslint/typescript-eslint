import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/prefer-as-const';

const ruleTester = new RuleTester();

ruleTester.run('prefer-as-const', rule, {
  valid: [
    "let foo = 'baz' as const;",
    'let foo = 1 as const;',
    "let foo = { bar: 'baz' as const };",
    'let foo = { bar: 1 as const };',
    "let foo = { bar: 'baz' };",
    'let foo = { bar: 2 };',
    noFormat`let foo = <bar>'bar';`,
    noFormat`let foo = <string>'bar';`,
    "let foo = 'bar' as string;",
    'let foo = `bar` as `bar`;',
    'let foo = `bar` as `foo`;',
    "let foo = `bar` as 'bar';",
    "let foo: string = 'bar';",
    'let foo: number = 1;',
    "let foo: 'bar' = baz;",
    "let foo = 'bar';",
    "let foo: 'bar';",
    'let foo = { bar };',
    "let foo: 'baz' = 'baz' as const;",
    `
      class foo {
        bar = 'baz';
      }
    `,
    `
      class foo {
        bar: 'baz';
      }
    `,
    `
      class foo {
        bar;
      }
    `,
    noFormat`
      class foo {
        bar = <baz>'baz';
      }
    `,
    `
      class foo {
        bar: string = 'baz';
      }
    `,
    `
      class foo {
        bar: number = 1;
      }
    `,
    `
      class foo {
        bar = 'baz' as const;
      }
    `,
    `
      class foo {
        bar = 2 as const;
      }
    `,
    `
      class foo {
        get bar(): 'bar' {}
        set bar(bar: 'bar') {}
      }
    `,
    `
      class foo {
        bar = () => 'bar' as const;
      }
    `,
    `
      type BazFunction = () => 'baz';
      class foo {
        bar: BazFunction = () => 'bar';
      }
    `,
    `
      class foo {
        bar(): void {}
      }
    `,
  ],
  invalid: [
    {
      code: "let foo = { bar: 'baz' as 'baz' };",
      errors: [
        {
          column: 27,
          line: 1,
          messageId: 'preferConstAssertion',
        },
      ],
      output: "let foo = { bar: 'baz' as const };",
    },
    {
      code: 'let foo = { bar: 1 as 1 };',
      errors: [
        {
          column: 23,
          line: 1,
          messageId: 'preferConstAssertion',
        },
      ],
      output: 'let foo = { bar: 1 as const };',
    },
    {
      code: "let []: 'bar' = 'bar';",
      errors: [
        {
          column: 9,
          line: 1,
          messageId: 'variableConstAssertion',
          suggestions: [
            {
              messageId: 'variableSuggest',
              output: "let [] = 'bar' as const;",
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: "let foo: 'bar' = 'bar';",
      errors: [
        {
          column: 10,
          line: 1,
          messageId: 'variableConstAssertion',
          suggestions: [
            {
              messageId: 'variableSuggest',
              output: "let foo = 'bar' as const;",
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: 'let foo: 2 = 2;',
      errors: [
        {
          column: 10,
          line: 1,
          messageId: 'variableConstAssertion',
          suggestions: [
            {
              messageId: 'variableSuggest',
              output: 'let foo = 2 as const;',
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: "let foo: 'bar' = 'bar' as 'bar';",
      errors: [
        {
          column: 27,
          line: 1,
          messageId: 'preferConstAssertion',
        },
      ],
      output: "let foo: 'bar' = 'bar' as const;",
    },
    {
      code: noFormat`let foo = <'bar'>'bar';`,
      errors: [
        {
          column: 12,
          line: 1,
          messageId: 'preferConstAssertion',
        },
      ],
      output: "let foo = <const>'bar';",
    },
    {
      code: noFormat`let foo = <4>4;`,
      errors: [
        {
          column: 12,
          line: 1,
          messageId: 'preferConstAssertion',
        },
      ],
      output: 'let foo = <const>4;',
    },
    {
      code: "let foo = 'bar' as 'bar';",
      errors: [
        {
          column: 20,
          line: 1,
          messageId: 'preferConstAssertion',
        },
      ],
      output: "let foo = 'bar' as const;",
    },
    {
      code: 'let foo = 5 as 5;',
      errors: [
        {
          column: 16,
          line: 1,
          messageId: 'preferConstAssertion',
        },
      ],
      output: 'let foo = 5 as const;',
    },
    {
      code: `
class foo {
  bar: 'baz' = 'baz';
}
      `,
      errors: [
        {
          column: 8,
          line: 3,
          messageId: 'variableConstAssertion',
          suggestions: [
            {
              messageId: 'variableSuggest',
              output: `
class foo {
  bar = 'baz' as const;
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
class foo {
  bar: 2 = 2;
}
      `,
      errors: [
        {
          column: 8,
          line: 3,
          messageId: 'variableConstAssertion',
          suggestions: [
            {
              messageId: 'variableSuggest',
              output: `
class foo {
  bar = 2 as const;
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: noFormat`
class foo {
  foo = <'bar'>'bar';
}
      `,
      errors: [
        {
          column: 10,
          line: 3,
          messageId: 'preferConstAssertion',
        },
      ],
      output: `
class foo {
  foo = <const>'bar';
}
      `,
    },
    {
      code: `
class foo {
  foo = 'bar' as 'bar';
}
      `,
      errors: [
        {
          column: 18,
          line: 3,
          messageId: 'preferConstAssertion',
        },
      ],
      output: `
class foo {
  foo = 'bar' as const;
}
      `,
    },
    {
      code: `
class foo {
  foo = 5 as 5;
}
      `,
      errors: [
        {
          column: 14,
          line: 3,
          messageId: 'preferConstAssertion',
        },
      ],
      output: `
class foo {
  foo = 5 as const;
}
      `,
    },
  ],
});
