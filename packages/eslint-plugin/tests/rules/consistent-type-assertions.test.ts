import type { TSESTree } from '@typescript-eslint/utils';

import * as parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/consistent-type-assertions';

const ruleTester = new RuleTester();

ruleTester.run('consistent-type-assertions', rule, {
  valid: [
    {
      code: 'const x = new Generic<int>() as Foo;',
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'const x = b as A;',
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'const x = [1] as readonly number[];',
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: "const x = 'string' as a | b;",
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: "const x = !'string' as A;",
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'const x = (a as A) + b;',
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'const x = new Generic<string>() as Foo;',
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'const x = new (Generic<string> as Foo)();',
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: "const x = new (Generic<string> as Foo)('string');",
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'const x = () => ({ bar: 5 }) as Foo;',
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'const x = () => bar as Foo;',
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: "const x = bar<string>`${'baz'}` as Foo;",
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: "const x = { key: 'value' } as const;",
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'const x = <Foo>new Generic<int>();',
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'const x = <A>b;',
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'const x = <readonly number[]>[1];',
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: "const x = <a | b>'string';",
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: "const x = <A>!'string';",
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'const x = <A>a + b;',
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'const x = <Foo>new Generic<string>();',
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'const x = new (<Foo>Generic<string>)();',
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: "const x = new (<Foo>Generic<string>)('string');",
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'const x = () => <Foo>{ bar: 5 };',
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'const x = () => <Foo>bar;',
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: "const x = <Foo>bar<string>`${'baz'}`;",
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: "const x = <const>{ key: 'value' };",
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'const x = {} as Foo<int>;',
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' }],
    },
    {
      code: 'const x = {} as a | b;',
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' }],
    },
    {
      code: 'const x = ({} as A) + b;',
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' }],
    },
    {
      code: 'print({ bar: 5 } as Foo);',
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' }],
    },
    {
      code: 'new print({ bar: 5 } as Foo);',
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' }],
    },
    {
      code: `
function foo() {
  throw { bar: 5 } as Foo;
}
      `,
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' }],
    },
    {
      code: 'function b(x = {} as Foo.Bar) {}',
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' }],
    },
    {
      code: 'function c(x = {} as Foo) {}',
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' }],
    },
    {
      code: 'print?.({ bar: 5 } as Foo);',
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' }],
    },
    {
      code: 'print?.call({ bar: 5 } as Foo);',
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' }],
    },
    {
      code: 'print`${{ bar: 5 } as Foo}`;',
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' }],
    },
    {
      code: 'const x = <Foo<int>>{};',
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'const x = <a | b>{};',
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'const x = <A>{} + b;',
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'print(<Foo>{ bar: 5 });',
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'new print(<Foo>{ bar: 5 });',
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: `
function foo() {
  throw <Foo>{ bar: 5 };
}
      `,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'print?.(<Foo>{ bar: 5 });',
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'print?.call(<Foo>{ bar: 5 });',
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'print`${<Foo>{ bar: 5 }}`;',
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: 'print({ bar: 5 } as Foo);',
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: 'new print({ bar: 5 } as Foo);',
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: `
function foo() {
  throw { bar: 5 } as Foo;
}
      `,
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: 'function b(x = {} as Foo.Bar) {}',
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: 'function c(x = {} as Foo) {}',
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: 'print?.({ bar: 5 } as Foo);',
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: 'print?.call({ bar: 5 } as Foo);',
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: 'print`${{ bar: 5 } as Foo}`;',
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: 'print(<Foo>{ bar: 5 });',
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: 'new print(<Foo>{ bar: 5 });',
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: `
function foo() {
  throw <Foo>{ bar: 5 };
}
      `,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: 'print?.(<Foo>{ bar: 5 });',
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: 'print?.call(<Foo>{ bar: 5 });',
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: 'print`${<Foo>{ bar: 5 }}`;',
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },

    {
      code: 'const x = [] as string[];',
      options: [
        {
          assertionStyle: 'as',
        },
      ],
    },
    {
      code: "const x = ['a'] as Array<string>;",
      options: [
        {
          assertionStyle: 'as',
        },
      ],
    },
    {
      code: 'const x = <string[]>[];',
      options: [
        {
          assertionStyle: 'angle-bracket',
        },
      ],
    },
    {
      code: 'const x = <Array<string>>[];',
      options: [
        {
          assertionStyle: 'angle-bracket',
        },
      ],
    },
    {
      code: 'print([5] as Foo);',
      options: [
        {
          arrayLiteralTypeAssertions: 'allow-as-parameter',
          assertionStyle: 'as',
        },
      ],
    },
    {
      code: `
function foo() {
  throw [5] as Foo;
}
      `,
      options: [
        {
          arrayLiteralTypeAssertions: 'allow-as-parameter',
          assertionStyle: 'as',
        },
      ],
    },
    {
      code: 'function b(x = [5] as Foo.Bar) {}',
      options: [
        {
          arrayLiteralTypeAssertions: 'allow-as-parameter',
          assertionStyle: 'as',
        },
      ],
    },
    {
      code: 'print?.([5] as Foo);',
      options: [
        {
          arrayLiteralTypeAssertions: 'allow-as-parameter',
          assertionStyle: 'as',
        },
      ],
    },
    {
      code: 'print?.call([5] as Foo);',
      options: [
        {
          arrayLiteralTypeAssertions: 'allow-as-parameter',
          assertionStyle: 'as',
        },
      ],
    },
    {
      code: 'print`${[5] as Foo}`;',
      options: [
        {
          arrayLiteralTypeAssertions: 'allow-as-parameter',
          assertionStyle: 'as',
        },
      ],
    },
    {
      code: 'new Print([5] as Foo);',
      options: [
        {
          arrayLiteralTypeAssertions: 'allow-as-parameter',
          assertionStyle: 'as',
        },
      ],
    },
    {
      code: 'const bar = <Foo style={[5] as Bar} />;',
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      options: [
        {
          arrayLiteralTypeAssertions: 'allow-as-parameter',
          assertionStyle: 'as',
        },
      ],
    },
    {
      code: 'print(<Foo>[5]);',
      options: [
        {
          arrayLiteralTypeAssertions: 'allow-as-parameter',
          assertionStyle: 'angle-bracket',
        },
      ],
    },
    {
      code: `
function foo() {
  throw <Foo>[5];
}
      `,
      options: [
        {
          arrayLiteralTypeAssertions: 'allow-as-parameter',
          assertionStyle: 'angle-bracket',
        },
      ],
    },
    {
      code: 'function b(x = <Foo.Bar>[5]) {}',
      options: [
        {
          arrayLiteralTypeAssertions: 'allow-as-parameter',
          assertionStyle: 'angle-bracket',
        },
      ],
    },
    {
      code: 'print?.(<Foo>[5]);',
      options: [
        {
          arrayLiteralTypeAssertions: 'allow-as-parameter',
          assertionStyle: 'angle-bracket',
        },
      ],
    },
    {
      code: 'print?.call(<Foo>[5]);',
      options: [
        {
          arrayLiteralTypeAssertions: 'allow-as-parameter',
          assertionStyle: 'angle-bracket',
        },
      ],
    },
    {
      code: 'print`${<Foo>[5]}`;',
      options: [
        {
          arrayLiteralTypeAssertions: 'allow-as-parameter',
          assertionStyle: 'angle-bracket',
        },
      ],
    },
    {
      code: 'new Print(<Foo>[5]);',
      options: [
        {
          arrayLiteralTypeAssertions: 'allow-as-parameter',
          assertionStyle: 'angle-bracket',
        },
      ],
    },
    { code: 'const x = <const>[1];', options: [{ assertionStyle: 'never' }] },
    { code: 'const x = [1] as const;', options: [{ assertionStyle: 'never' }] },
    {
      code: 'const bar = <Foo style={{ bar: 5 } as Bar} />;',
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: '123;',
      languageOptions: {
        // simulate a 3rd party parser that doesn't provide parser services
        parser: {
          parse: (): TSESTree.Program => parser.parse('123;'),
        },
      },
    },
    {
      code: `
const x = { key: 'value' } as any;
      `,
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
    },
    {
      code: `
const x = { key: 'value' } as unknown;
      `,
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
    },
  ],
  invalid: [
    {
      code: 'const x = new Generic<int>() as Foo;',
      errors: [
        {
          column: 11,
          endColumn: 36,
          endLine: 1,
          line: 1,
          messageId: 'angle-bracket',
        },
      ],
      options: [{ assertionStyle: 'angle-bracket' }],
    },
    {
      code: 'const x = b as A;',
      errors: [
        {
          column: 11,
          endColumn: 17,
          endLine: 1,
          line: 1,
          messageId: 'angle-bracket',
        },
      ],
      options: [{ assertionStyle: 'angle-bracket' }],
    },
    {
      code: 'const x = [1] as readonly number[];',
      errors: [
        {
          column: 11,
          endColumn: 35,
          endLine: 1,
          line: 1,
          messageId: 'angle-bracket',
        },
      ],
      options: [{ assertionStyle: 'angle-bracket' }],
    },
    {
      code: "const x = 'string' as a | b;",
      errors: [
        {
          column: 11,
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'angle-bracket',
        },
      ],
      options: [{ assertionStyle: 'angle-bracket' }],
    },
    {
      code: "const x = !'string' as A;",
      errors: [
        {
          column: 11,
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'angle-bracket',
        },
      ],
      options: [{ assertionStyle: 'angle-bracket' }],
    },
    {
      code: 'const x = (a as A) + b;',
      errors: [
        {
          column: 12,
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'angle-bracket',
        },
      ],
      options: [{ assertionStyle: 'angle-bracket' }],
    },
    {
      code: 'const x = new Generic<string>() as Foo;',
      errors: [
        {
          column: 11,
          endColumn: 39,
          endLine: 1,
          line: 1,
          messageId: 'angle-bracket',
        },
      ],
      options: [{ assertionStyle: 'angle-bracket' }],
    },
    {
      code: 'const x = new (Generic<string> as Foo)();',
      errors: [
        {
          column: 16,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'angle-bracket',
        },
      ],
      options: [{ assertionStyle: 'angle-bracket' }],
    },
    {
      code: "const x = new (Generic<string> as Foo)('string');",
      errors: [
        {
          column: 16,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'angle-bracket',
        },
      ],
      options: [{ assertionStyle: 'angle-bracket' }],
    },
    {
      code: 'const x = () => ({ bar: 5 }) as Foo;',
      errors: [
        {
          column: 17,
          endColumn: 36,
          endLine: 1,
          line: 1,
          messageId: 'angle-bracket',
        },
      ],
      options: [{ assertionStyle: 'angle-bracket' }],
    },
    {
      code: 'const x = () => bar as Foo;',
      errors: [
        {
          column: 17,
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'angle-bracket',
        },
      ],
      options: [{ assertionStyle: 'angle-bracket' }],
    },
    {
      code: "const x = bar<string>`${'baz'}` as Foo;",
      errors: [
        {
          column: 11,
          endColumn: 39,
          endLine: 1,
          line: 1,
          messageId: 'angle-bracket',
        },
      ],
      options: [{ assertionStyle: 'angle-bracket' }],
    },
    {
      code: "const x = { key: 'value' } as const;",
      errors: [
        {
          column: 11,
          endColumn: 36,
          endLine: 1,
          line: 1,
          messageId: 'angle-bracket',
        },
      ],
      options: [{ assertionStyle: 'angle-bracket' }],
    },
    {
      code: 'const x = <Foo>new Generic<int>();',
      errors: [
        {
          column: 11,
          endColumn: 34,
          endLine: 1,
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: 'const x = new Generic<int>() as Foo;',
    },
    {
      code: 'const x = <A>b;',
      errors: [
        {
          column: 11,
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: 'const x = b as A;',
    },
    {
      code: 'const x = <readonly number[]>[1];',
      errors: [
        {
          column: 11,
          endColumn: 33,
          endLine: 1,
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: 'const x = [1] as readonly number[];',
    },
    {
      code: "const x = <a | b>'string';",
      errors: [
        {
          column: 11,
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: "const x = 'string' as a | b;",
    },
    {
      code: "const x = <A>!'string';",
      errors: [
        {
          column: 11,
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: "const x = !'string' as A;",
    },
    {
      code: 'const x = <A>a + b;',
      errors: [
        {
          column: 11,
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: 'const x = (a as A) + b;',
    },
    {
      code: 'const x = <Foo>new Generic<string>();',
      errors: [
        {
          column: 11,
          endColumn: 37,
          endLine: 1,
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: 'const x = new Generic<string>() as Foo;',
    },
    {
      code: 'const x = new (<Foo>Generic<string>)();',
      errors: [
        {
          column: 16,
          endColumn: 36,
          endLine: 1,
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: 'const x = new ((Generic<string>) as Foo)();',
    },
    {
      code: "const x = new (<Foo>Generic<string>)('string');",
      errors: [
        {
          column: 16,
          endColumn: 36,
          endLine: 1,
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: "const x = new ((Generic<string>) as Foo)('string');",
    },
    {
      code: 'const x = () => <Foo>{ bar: 5 };',
      errors: [
        {
          column: 17,
          endColumn: 32,
          endLine: 1,
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: 'const x = () => ({ bar: 5 } as Foo);',
    },
    {
      code: 'const x = () => <Foo>bar;',
      errors: [
        {
          column: 17,
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: 'const x = () => (bar as Foo);',
    },
    {
      code: "const x = <Foo>bar<string>`${'baz'}`;",
      errors: [
        {
          column: 11,
          endColumn: 37,
          endLine: 1,
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: "const x = bar<string>`${'baz'}` as Foo;",
    },
    {
      code: "const x = <const>{ key: 'value' };",
      errors: [
        {
          column: 11,
          endColumn: 34,
          endLine: 1,
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: "const x = { key: 'value' } as const;",
    },
    {
      code: 'const x = new Generic<int>() as Foo;',
      errors: [
        {
          column: 11,
          endColumn: 36,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: 'const x = b as A;',
      errors: [
        {
          column: 11,
          endColumn: 17,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: 'const x = [1] as readonly number[];',
      errors: [
        {
          column: 11,
          endColumn: 35,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: "const x = 'string' as a | b;",
      errors: [
        {
          column: 11,
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: "const x = !'string' as A;",
      errors: [
        {
          column: 11,
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: 'const x = (a as A) + b;',
      errors: [
        {
          column: 12,
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: 'const x = new Generic<string>() as Foo;',
      errors: [
        {
          column: 11,
          endColumn: 39,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: 'const x = new (Generic<string> as Foo)();',
      errors: [
        {
          column: 16,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: "const x = new (Generic<string> as Foo)('string');",
      errors: [
        {
          column: 16,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: 'const x = () => ({ bar: 5 }) as Foo;',
      errors: [
        {
          column: 17,
          endColumn: 36,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: 'const x = () => bar as Foo;',
      errors: [
        {
          column: 17,
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: "const x = bar<string>`${'baz'}` as Foo;",
      errors: [
        {
          column: 11,
          endColumn: 39,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: 'const x = <Foo>new Generic<int>();',
      errors: [
        {
          column: 11,
          endColumn: 34,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: 'const x = <A>b;',
      errors: [
        {
          column: 11,
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: 'const x = <readonly number[]>[1];',
      errors: [
        {
          column: 11,
          endColumn: 33,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: "const x = <a | b>'string';",
      errors: [
        {
          column: 11,
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: "const x = <A>!'string';",
      errors: [
        {
          column: 11,
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: 'const x = <A>a + b;',
      errors: [
        {
          column: 11,
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: 'const x = <Foo>new Generic<string>();',
      errors: [
        {
          column: 11,
          endColumn: 37,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: 'const x = new (<Foo>Generic<string>)();',
      errors: [
        {
          column: 16,
          endColumn: 36,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: "const x = new (<Foo>Generic<string>)('string');",
      errors: [
        {
          column: 16,
          endColumn: 36,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: 'const x = () => <Foo>{ bar: 5 };',
      errors: [
        {
          column: 17,
          endColumn: 32,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: 'const x = () => <Foo>bar;',
      errors: [
        {
          column: 17,
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: "const x = <Foo>bar<string>`${'baz'}`;",
      errors: [
        {
          column: 11,
          endColumn: 37,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: 'const x = {} as Foo<int>;',
      errors: [
        {
          column: 11,
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo<int>' },
              messageId: 'replaceObjectTypeAssertionWithAnnotation',
              output: 'const x: Foo<int> = {};',
            },
            {
              data: { cast: 'Foo<int>' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'const x = {} satisfies Foo<int>;',
            },
          ],
        },
      ],
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: 'const x = {} as a | b;',
      errors: [
        {
          column: 11,
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'a | b' },
              messageId: 'replaceObjectTypeAssertionWithAnnotation',
              output: 'const x: a | b = {};',
            },
            {
              data: { cast: 'a | b' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'const x = {} satisfies a | b;',
            },
          ],
        },
      ],
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: 'const x = ({} as A) + b;',
      errors: [
        {
          column: 12,
          endColumn: 19,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'A' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'const x = ({} satisfies A) + b;',
            },
          ],
        },
      ],
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: 'const x = <Foo<int>>{};',
      errors: [
        {
          column: 11,
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo<int>' },
              messageId: 'replaceObjectTypeAssertionWithAnnotation',
              output: 'const x: Foo<int> = {};',
            },
            {
              data: { cast: 'Foo<int>' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'const x = {} satisfies Foo<int>;',
            },
          ],
        },
      ],
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: 'const x = <a | b>{};',
      errors: [
        {
          column: 11,
          endColumn: 20,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'a | b' },
              messageId: 'replaceObjectTypeAssertionWithAnnotation',
              output: 'const x: a | b = {};',
            },
            {
              data: { cast: 'a | b' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'const x = {} satisfies a | b;',
            },
          ],
        },
      ],
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: 'const x = <A>{} + b;',
      errors: [
        {
          column: 11,
          endColumn: 16,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'A' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'const x = {} satisfies A + b;',
            },
          ],
        },
      ],
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: 'const x = {} as Foo<int>;',
      errors: [
        {
          column: 11,
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo<int>' },
              messageId: 'replaceObjectTypeAssertionWithAnnotation',
              output: 'const x: Foo<int> = {};',
            },
            {
              data: { cast: 'Foo<int>' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'const x = {} satisfies Foo<int>;',
            },
          ],
        },
      ],
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
    },
    {
      code: 'const x = {} as a | b;',
      errors: [
        {
          column: 11,
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'a | b' },
              messageId: 'replaceObjectTypeAssertionWithAnnotation',
              output: 'const x: a | b = {};',
            },
            {
              data: { cast: 'a | b' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'const x = {} satisfies a | b;',
            },
          ],
        },
      ],
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
    },
    {
      code: 'const x = ({} as A) + b;',
      errors: [
        {
          column: 12,
          endColumn: 19,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'A' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'const x = ({} satisfies A) + b;',
            },
          ],
        },
      ],
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
    },
    {
      code: 'print({ bar: 5 } as Foo);',
      errors: [
        {
          column: 7,
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'print({ bar: 5 } satisfies Foo);',
            },
          ],
        },
      ],
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
    },
    {
      code: 'new print({ bar: 5 } as Foo);',
      errors: [
        {
          column: 11,
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'new print({ bar: 5 } satisfies Foo);',
            },
          ],
        },
      ],
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
    },
    {
      code: `
function foo() {
  throw { bar: 5 } as Foo;
}
      `,
      errors: [
        {
          column: 9,
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: `
function foo() {
  throw { bar: 5 } satisfies Foo;
}
      `,
            },
          ],
        },
      ],
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
    },
    {
      code: 'function b(x = {} as Foo.Bar) {}',
      errors: [
        {
          column: 16,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo.Bar' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'function b(x = {} satisfies Foo.Bar) {}',
            },
          ],
        },
      ],
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
    },
    {
      code: 'function c(x = {} as Foo) {}',
      errors: [
        {
          column: 16,
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'function c(x = {} satisfies Foo) {}',
            },
          ],
        },
      ],
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
    },
    {
      code: 'print?.({ bar: 5 } as Foo);',
      errors: [
        {
          column: 9,
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'print?.({ bar: 5 } satisfies Foo);',
            },
          ],
        },
      ],
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
    },
    {
      code: 'print?.call({ bar: 5 } as Foo);',
      errors: [
        {
          column: 13,
          endColumn: 30,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'print?.call({ bar: 5 } satisfies Foo);',
            },
          ],
        },
      ],
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
    },
    {
      code: 'print`${{ bar: 5 } as Foo}`;',
      errors: [
        {
          column: 9,
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'print`${{ bar: 5 } satisfies Foo}`;',
            },
          ],
        },
      ],
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
    },
    {
      code: 'const x = <Foo<int>>{};',
      errors: [
        {
          column: 11,
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo<int>' },
              messageId: 'replaceObjectTypeAssertionWithAnnotation',
              output: 'const x: Foo<int> = {};',
            },
            {
              data: { cast: 'Foo<int>' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'const x = {} satisfies Foo<int>;',
            },
          ],
        },
      ],
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'never',
        },
      ],
    },
    {
      code: 'const x = <a | b>{};',
      errors: [
        {
          column: 11,
          endColumn: 20,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'a | b' },
              messageId: 'replaceObjectTypeAssertionWithAnnotation',
              output: 'const x: a | b = {};',
            },
            {
              data: { cast: 'a | b' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'const x = {} satisfies a | b;',
            },
          ],
        },
      ],
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'never',
        },
      ],
    },
    {
      code: 'const x = <A>{} + b;',
      errors: [
        {
          column: 11,
          endColumn: 16,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'A' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'const x = {} satisfies A + b;',
            },
          ],
        },
      ],
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'never',
        },
      ],
    },
    {
      code: 'print(<Foo>{ bar: 5 });',
      errors: [
        {
          column: 7,
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'print({ bar: 5 } satisfies Foo);',
            },
          ],
        },
      ],
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'never',
        },
      ],
    },
    {
      code: 'new print(<Foo>{ bar: 5 });',
      errors: [
        {
          column: 11,
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'new print({ bar: 5 } satisfies Foo);',
            },
          ],
        },
      ],
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'never',
        },
      ],
    },
    {
      code: `
function foo() {
  throw <Foo>{ bar: 5 };
}
      `,
      errors: [
        {
          column: 9,
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: `
function foo() {
  throw { bar: 5 } satisfies Foo;
}
      `,
            },
          ],
        },
      ],
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'never',
        },
      ],
    },
    {
      code: 'print?.(<Foo>{ bar: 5 });',
      errors: [
        {
          column: 9,
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'print?.({ bar: 5 } satisfies Foo);',
            },
          ],
        },
      ],
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'never',
        },
      ],
    },
    {
      code: 'print?.call(<Foo>{ bar: 5 });',
      errors: [
        {
          column: 13,
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'print?.call({ bar: 5 } satisfies Foo);',
            },
          ],
        },
      ],
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'never',
        },
      ],
    },
    {
      code: 'print`${<Foo>{ bar: 5 }}`;',
      errors: [
        {
          column: 9,
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'print`${{ bar: 5 } satisfies Foo}`;',
            },
          ],
        },
      ],
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'never',
        },
      ],
    },
    {
      code: 'const foo = <Foo style={{ bar: 5 } as Bar} />;',
      errors: [
        { column: 25, endColumn: 42, endLine: 1, line: 1, messageId: 'never' },
      ],
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      options: [{ assertionStyle: 'never' }],
      output: null,
    },
    {
      code: 'const a = <any>(b, c);',
      errors: [
        {
          column: 11,
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'as',
        },
      ],
      options: [
        {
          assertionStyle: 'as',
        },
      ],
      output: `const a = (b, c) as any;`,
    },
    {
      code: 'const f = <any>(() => {});',
      errors: [
        {
          column: 11,
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'as',
        },
      ],
      options: [
        {
          assertionStyle: 'as',
        },
      ],
      output: 'const f = (() => {}) as any;',
    },
    {
      code: 'const f = <any>function () {};',
      errors: [
        {
          column: 11,
          endColumn: 30,
          endLine: 1,
          line: 1,
          messageId: 'as',
        },
      ],
      options: [
        {
          assertionStyle: 'as',
        },
      ],
      output: 'const f = function () {} as any;',
    },
    {
      code: 'const f = <any>(async () => {});',
      errors: [
        {
          column: 11,
          endColumn: 32,
          endLine: 1,
          line: 1,
          messageId: 'as',
        },
      ],
      options: [
        {
          assertionStyle: 'as',
        },
      ],
      output: 'const f = (async () => {}) as any;',
    },
    {
      // prettier wants to remove the parens around the yield expression,
      // but they're required.
      code: `
function* g() {
  const y = <any>(yield a);
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 27,
          endLine: 3,
          line: 3,
          messageId: 'as',
        },
      ],
      options: [
        {
          assertionStyle: 'as',
        },
      ],
      output: `
function* g() {
  const y = (yield a) as any;
}
      `,
    },
    {
      code: `
declare let x: number, y: number;
const bs = <any>(x <<= y);
      `,
      errors: [
        {
          column: 12,
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'as',
        },
      ],
      options: [
        {
          assertionStyle: 'as',
        },
      ],
      output: `
declare let x: number, y: number;
const bs = (x <<= y) as any;
      `,
    },
    {
      code: 'const ternary = <any>(true ? x : y);',
      errors: [
        {
          column: 17,
          endColumn: 36,
          endLine: 1,
          line: 1,
          messageId: 'as',
        },
      ],
      options: [
        {
          assertionStyle: 'as',
        },
      ],
      output: 'const ternary = (true ? x : y) as any;',
    },
    {
      code: 'const x = [] as string[];',
      errors: [
        {
          column: 11,
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [
        {
          assertionStyle: 'never',
        },
      ],
    },
    {
      code: 'const x = <string[]>[];',
      errors: [
        {
          column: 11,
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'never',
        },
      ],
      options: [
        {
          assertionStyle: 'never',
        },
      ],
    },
    {
      code: 'const x = [] as string[];',
      errors: [
        {
          column: 11,
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'angle-bracket',
        },
      ],
      options: [
        {
          assertionStyle: 'angle-bracket',
        },
      ],
    },
    {
      code: 'const x = <string[]>[];',
      errors: [
        {
          column: 11,
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'as',
        },
      ],
      options: [
        {
          assertionStyle: 'as',
        },
      ],
      output: 'const x = [] as string[];',
    },
    {
      code: 'const x = [] as string[];',
      errors: [
        {
          column: 11,
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedArrayTypeAssertion',
          suggestions: [
            {
              data: { cast: 'string[]' },
              messageId: 'replaceArrayTypeAssertionWithAnnotation',
              output: 'const x: string[] = [];',
            },
            {
              data: { cast: 'string[]' },
              messageId: 'replaceArrayTypeAssertionWithSatisfies',
              output: 'const x = [] satisfies string[];',
            },
          ],
        },
      ],
      options: [
        {
          arrayLiteralTypeAssertions: 'never',
          assertionStyle: 'as',
        },
      ],
    },
    {
      code: 'const x = <string[]>[];',
      errors: [
        {
          column: 11,
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedArrayTypeAssertion',
          suggestions: [
            {
              data: { cast: 'string[]' },
              messageId: 'replaceArrayTypeAssertionWithAnnotation',
              output: 'const x: string[] = [];',
            },
            {
              data: { cast: 'string[]' },
              messageId: 'replaceArrayTypeAssertionWithSatisfies',
              output: 'const x = [] satisfies string[];',
            },
          ],
        },
      ],
      options: [
        {
          arrayLiteralTypeAssertions: 'never',
          assertionStyle: 'angle-bracket',
        },
      ],
    },
    {
      code: 'print([5] as Foo);',
      errors: [
        {
          column: 7,
          endColumn: 17,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedArrayTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceArrayTypeAssertionWithSatisfies',
              output: `print([5] satisfies Foo);`,
            },
          ],
        },
      ],
      options: [
        {
          arrayLiteralTypeAssertions: 'never',
          assertionStyle: 'as',
        },
      ],
    },
    {
      code: 'new print([5] as Foo);',
      errors: [
        {
          column: 11,
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedArrayTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceArrayTypeAssertionWithSatisfies',
              output: `new print([5] satisfies Foo);`,
            },
          ],
        },
      ],
      options: [
        {
          arrayLiteralTypeAssertions: 'never',
          assertionStyle: 'as',
        },
      ],
    },
    {
      code: 'function b(x = [5] as Foo.Bar) {}',
      errors: [
        {
          column: 16,
          endColumn: 30,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedArrayTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo.Bar' },
              messageId: 'replaceArrayTypeAssertionWithSatisfies',
              output: `function b(x = [5] satisfies Foo.Bar) {}`,
            },
          ],
        },
      ],
      options: [
        {
          arrayLiteralTypeAssertions: 'never',
          assertionStyle: 'as',
        },
      ],
    },
    {
      code: `
function foo() {
  throw [5] as Foo;
}
      `,
      errors: [
        {
          column: 9,
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'unexpectedArrayTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceArrayTypeAssertionWithSatisfies',
              output: `
function foo() {
  throw [5] satisfies Foo;
}
      `,
            },
          ],
        },
      ],
      options: [
        {
          arrayLiteralTypeAssertions: 'never',
          assertionStyle: 'as',
        },
      ],
    },
    {
      code: 'print`${[5] as Foo}`;',
      errors: [
        {
          column: 9,
          endColumn: 19,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedArrayTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceArrayTypeAssertionWithSatisfies',
              output: 'print`${[5] satisfies Foo}`;',
            },
          ],
        },
      ],
      options: [
        {
          arrayLiteralTypeAssertions: 'never',
          assertionStyle: 'as',
        },
      ],
    },
    {
      code: 'const foo = () => [5] as Foo;',
      errors: [
        {
          column: 19,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedArrayTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceArrayTypeAssertionWithSatisfies',
              output: 'const foo = () => [5] satisfies Foo;',
            },
          ],
        },
      ],
      options: [
        {
          arrayLiteralTypeAssertions: 'allow-as-parameter',
          assertionStyle: 'as',
        },
      ],
    },
    {
      code: 'new print(<Foo>[5]);',
      errors: [
        {
          column: 11,
          endColumn: 19,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedArrayTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceArrayTypeAssertionWithSatisfies',
              output: `new print([5] satisfies Foo);`,
            },
          ],
        },
      ],
      options: [
        {
          arrayLiteralTypeAssertions: 'never',
          assertionStyle: 'angle-bracket',
        },
      ],
    },
    {
      code: 'function b(x = <Foo.Bar>[5]) {}',
      errors: [
        {
          column: 16,
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedArrayTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo.Bar' },
              messageId: 'replaceArrayTypeAssertionWithSatisfies',
              output: `function b(x = [5] satisfies Foo.Bar) {}`,
            },
          ],
        },
      ],
      options: [
        {
          arrayLiteralTypeAssertions: 'never',
          assertionStyle: 'angle-bracket',
        },
      ],
    },
    {
      code: `
function foo() {
  throw <Foo>[5];
}
      `,
      errors: [
        {
          column: 9,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'unexpectedArrayTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceArrayTypeAssertionWithSatisfies',
              output: `
function foo() {
  throw [5] satisfies Foo;
}
      `,
            },
          ],
        },
      ],
      options: [
        {
          arrayLiteralTypeAssertions: 'never',
          assertionStyle: 'angle-bracket',
        },
      ],
    },
    {
      code: 'print`${<Foo>[5]}`;',
      errors: [
        {
          column: 9,
          endColumn: 17,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedArrayTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceArrayTypeAssertionWithSatisfies',
              output: 'print`${[5] satisfies Foo}`;',
            },
          ],
        },
      ],
      options: [
        {
          arrayLiteralTypeAssertions: 'never',
          assertionStyle: 'angle-bracket',
        },
      ],
    },
    {
      code: 'const foo = <Foo>[5];',
      errors: [
        {
          column: 13,
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedArrayTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceArrayTypeAssertionWithAnnotation',
              output: 'const foo: Foo = [5];',
            },
            {
              data: { cast: 'Foo' },
              messageId: 'replaceArrayTypeAssertionWithSatisfies',
              output: 'const foo = [5] satisfies Foo;',
            },
          ],
        },
      ],
      options: [
        {
          arrayLiteralTypeAssertions: 'allow-as-parameter',
          assertionStyle: 'angle-bracket',
        },
      ],
    },
  ],
});
