import rule from '../../src/rules/prefer-as-const';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('prefer-as-const', rule, {
  valid: [
    "let foo = 'baz' as const;",
    'let foo = 1 as const;',
    "let foo = { bar: 'baz' as const };",
    'let foo = { bar: 1 as const };',
    "let foo = { bar: 'baz' };",
    'let foo = { bar: 2 };',
    "let foo = <bar>'bar';",
    "let foo = <string>'bar';",
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
    `
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
      output: "let foo = { bar: 'baz' as const };",
      errors: [
        {
          messageId: 'preferConstAssertion',
          line: 1,
          column: 27,
        },
      ],
    },
    {
      code: 'let foo = { bar: 1 as 1 };',
      output: 'let foo = { bar: 1 as const };',
      errors: [
        {
          messageId: 'preferConstAssertion',
          line: 1,
          column: 23,
        },
      ],
    },
    {
      code: "let []: 'bar' = 'bar';",
      output: null,
      errors: [
        {
          messageId: 'variableConstAssertion',
          line: 1,
          column: 9,
        },
      ],
    },
    {
      code: "let foo: 'bar' = 'bar';",
      output: null,
      errors: [
        {
          messageId: 'variableConstAssertion',
          line: 1,
          column: 10,
          suggestions: [
            {
              messageId: 'variableSuggest',
              output: "let foo = 'bar' as const;",
            },
          ],
        },
      ],
    },
    {
      code: 'let foo: 2 = 2;',
      output: null,
      errors: [
        {
          messageId: 'variableConstAssertion',
          line: 1,
          column: 10,
          suggestions: [
            {
              messageId: 'variableSuggest',
              output: 'let foo = 2 as const;',
            },
          ],
        },
      ],
    },
    {
      code: "let foo: 'bar' = 'bar' as 'bar';",
      output: "let foo: 'bar' = 'bar' as const;",
      errors: [
        {
          messageId: 'preferConstAssertion',
          line: 1,
          column: 27,
        },
      ],
    },
    {
      code: "let foo = <'bar'>'bar';",
      output: "let foo = <const>'bar';",
      errors: [
        {
          messageId: 'preferConstAssertion',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'let foo = <4>4;',
      output: 'let foo = <const>4;',
      errors: [
        {
          messageId: 'preferConstAssertion',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: "let foo = 'bar' as 'bar';",
      output: "let foo = 'bar' as const;",
      errors: [
        {
          messageId: 'preferConstAssertion',
          line: 1,
          column: 20,
        },
      ],
    },
    {
      code: 'let foo = 5 as 5;',
      output: 'let foo = 5 as const;',
      errors: [
        {
          messageId: 'preferConstAssertion',
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: `
class foo {
  bar: 'baz' = 'baz';
}
      `.trimRight(),
      output: null,
      errors: [
        {
          messageId: 'variableConstAssertion',
          line: 3,
          column: 8,
          suggestions: [
            {
              messageId: 'variableSuggest',
              output: `
class foo {
  bar = 'baz' as const;
}
              `.trimRight(),
            },
          ],
        },
      ],
    },
    {
      code: `
class foo {
  bar: 2 = 2;
}
      `.trimRight(),
      output: null,
      errors: [
        {
          messageId: 'variableConstAssertion',
          line: 3,
          column: 8,
          suggestions: [
            {
              messageId: 'variableSuggest',
              output: `
class foo {
  bar = 2 as const;
}
              `.trimRight(),
            },
          ],
        },
      ],
    },
    {
      code: `
class foo {
  foo = <'bar'>'bar';
}
      `.trimRight(),
      output: `
class foo {
  foo = <const>'bar';
}
      `.trimRight(),
      errors: [
        {
          messageId: 'preferConstAssertion',
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
class foo {
  foo = 'bar' as 'bar';
}
      `.trimRight(),
      output: `
class foo {
  foo = 'bar' as const;
}
      `.trimRight(),
      errors: [
        {
          messageId: 'preferConstAssertion',
          line: 3,
          column: 18,
        },
      ],
    },
    {
      code: `
class foo {
  foo = 5 as 5;
}
      `.trimRight(),
      output: `
class foo {
  foo = 5 as const;
}
      `.trimRight(),
      errors: [
        {
          messageId: 'preferConstAssertion',
          line: 3,
          column: 14,
        },
      ],
    },
  ],
});
