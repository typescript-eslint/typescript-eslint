import type { TSESTree } from '@typescript-eslint/utils';

import * as parser from '@typescript-eslint/parser';
import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

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
      code: noFormat`const x = <Foo>new Generic<int>();`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: noFormat`const x = <A>b;`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: noFormat`const x = <readonly number[]>[1];`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: noFormat`const x = <a | b>'string';`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: noFormat`const x = <A>!'string';`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: noFormat`const x = <A>a + b;`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: noFormat`const x = <Foo>new Generic<string>();`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: noFormat`const x = new (<Foo>Generic<string>)();`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: noFormat`const x = new (<Foo>Generic<string>)('string');`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: noFormat`const x = () => <Foo>{ bar: 5 };`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: noFormat`const x = () => <Foo>bar;`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: noFormat`const x = <Foo>bar<string>\`\${'baz'}\`;`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: noFormat`const x = <const>{ key: 'value' };`,
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
      code: noFormat`const x = <Foo<int>>{};`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: noFormat`const x = <a | b>{};`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: noFormat`const x = <A>{} + b;`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: noFormat`print(<Foo>{ bar: 5 });`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: noFormat`new print(<Foo>{ bar: 5 });`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: noFormat`
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
      code: noFormat`print?.(<Foo>{ bar: 5 });`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: noFormat`print?.call(<Foo>{ bar: 5 });`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    },
    {
      code: noFormat`print\`\${<Foo>{ bar: 5 }}\`;`,
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
      code: noFormat`print(<Foo>{ bar: 5 });`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: noFormat`new print(<Foo>{ bar: 5 });`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: noFormat`
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
      code: noFormat`print?.(<Foo>{ bar: 5 });`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: noFormat`print?.call(<Foo>{ bar: 5 });`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
    {
      code: noFormat`print\`\${<Foo>{ bar: 5 }}\`;`,
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
      code: noFormat`const x = <string[]>[];`,
      options: [
        {
          assertionStyle: 'angle-bracket',
        },
      ],
    },
    {
      code: noFormat`const x = <Array<string>>[];`,
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
      code: noFormat`print(<Foo>[5]);`,
      options: [
        {
          arrayLiteralTypeAssertions: 'allow-as-parameter',
          assertionStyle: 'angle-bracket',
        },
      ],
    },
    {
      code: noFormat`
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
      code: noFormat`function b(x = <Foo.Bar>[5]) {}`,
      options: [
        {
          arrayLiteralTypeAssertions: 'allow-as-parameter',
          assertionStyle: 'angle-bracket',
        },
      ],
    },
    {
      code: noFormat`print?.(<Foo>[5]);`,
      options: [
        {
          arrayLiteralTypeAssertions: 'allow-as-parameter',
          assertionStyle: 'angle-bracket',
        },
      ],
    },
    {
      code: noFormat`print?.call(<Foo>[5]);`,
      options: [
        {
          arrayLiteralTypeAssertions: 'allow-as-parameter',
          assertionStyle: 'angle-bracket',
        },
      ],
    },
    {
      code: noFormat`print\`\${<Foo>[5]}\`;`,
      options: [
        {
          arrayLiteralTypeAssertions: 'allow-as-parameter',
          assertionStyle: 'angle-bracket',
        },
      ],
    },
    {
      code: noFormat`new Print(<Foo>[5]);`,
      options: [
        {
          arrayLiteralTypeAssertions: 'allow-as-parameter',
          assertionStyle: 'angle-bracket',
        },
      ],
    },
    {
      code: noFormat`const x = <const>[1];`,
      options: [{ assertionStyle: 'never' }],
    },
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
          line: 1,
          messageId: 'angle-bracket',
        },
      ],
      options: [{ assertionStyle: 'angle-bracket' }],
    },
    {
      code: noFormat`const x = <Foo>new Generic<int>();`,
      errors: [
        {
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: 'const x = new Generic<int>() as Foo;',
    },
    {
      code: noFormat`const x = <A>b;`,
      errors: [
        {
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: 'const x = b as A;',
    },
    {
      code: noFormat`const x = <readonly number[]>[1];`,
      errors: [
        {
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: 'const x = [1] as readonly number[];',
    },
    {
      code: noFormat`const x = <a | b>'string';`,
      errors: [
        {
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: "const x = 'string' as a | b;",
    },
    {
      code: noFormat`const x = <A>!'string';`,
      errors: [
        {
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: "const x = !'string' as A;",
    },
    {
      code: noFormat`const x = <A>a + b;`,
      errors: [
        {
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: 'const x = (a as A) + b;',
    },
    {
      code: noFormat`const x = <Foo>new Generic<string>();`,
      errors: [
        {
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: 'const x = new Generic<string>() as Foo;',
    },
    {
      code: noFormat`const x = new (<Foo>Generic<string>)();`,
      errors: [
        {
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: 'const x = new ((Generic<string>) as Foo)();',
    },
    {
      code: noFormat`const x = new (<Foo>Generic<string>)('string');`,
      errors: [
        {
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: "const x = new ((Generic<string>) as Foo)('string');",
    },
    {
      code: noFormat`const x = () => <Foo>{ bar: 5 };`,
      errors: [
        {
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: 'const x = () => ({ bar: 5 } as Foo);',
    },
    {
      code: noFormat`const x = () => <Foo>bar;`,
      errors: [
        {
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: 'const x = () => (bar as Foo);',
    },
    {
      code: noFormat`const x = <Foo>bar<string>\`\${'baz'}\`;`,
      errors: [
        {
          line: 1,
          messageId: 'as',
        },
      ],
      options: [{ assertionStyle: 'as' }],
      output: "const x = bar<string>`${'baz'}` as Foo;",
    },
    {
      code: noFormat`const x = <const>{ key: 'value' };`,
      errors: [
        {
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
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: noFormat`const x = <Foo>new Generic<int>();`,
      errors: [
        {
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: noFormat`const x = <A>b;`,
      errors: [
        {
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: noFormat`const x = <readonly number[]>[1];`,
      errors: [
        {
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: noFormat`const x = <a | b>'string';`,
      errors: [
        {
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: noFormat`const x = <A>!'string';`,
      errors: [
        {
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: noFormat`const x = <A>a + b;`,
      errors: [
        {
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: noFormat`const x = <Foo>new Generic<string>();`,
      errors: [
        {
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: noFormat`const x = new (<Foo>Generic<string>)();`,
      errors: [
        {
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: noFormat`const x = new (<Foo>Generic<string>)('string');`,
      errors: [
        {
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: noFormat`const x = () => <Foo>{ bar: 5 };`,
      errors: [
        {
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: noFormat`const x = () => <Foo>bar;`,
      errors: [
        {
          line: 1,
          messageId: 'never',
        },
      ],
      options: [{ assertionStyle: 'never' }],
    },
    {
      code: noFormat`const x = <Foo>bar<string>\`\${'baz'}\`;`,
      errors: [
        {
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
      code: noFormat`const x = <Foo<int>>{};`,
      errors: [
        {
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
      code: noFormat`const x = <a | b>{};`,
      errors: [
        {
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
      code: noFormat`const x = <A>{} + b;`,
      errors: [
        {
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
      code: noFormat`const x = <Foo<int>>{};`,
      errors: [
        {
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
      code: noFormat`const x = <a | b>{};`,
      errors: [
        {
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
      code: noFormat`const x = <A>{} + b;`,
      errors: [
        {
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
      code: noFormat`print(<Foo>{ bar: 5 });`,
      errors: [
        {
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
      code: noFormat`new print(<Foo>{ bar: 5 });`,
      errors: [
        {
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
      code: noFormat`
function foo() {
  throw <Foo>{ bar: 5 };
}
      `,
      errors: [
        {
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
      code: noFormat`print?.(<Foo>{ bar: 5 });`,
      errors: [
        {
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
      code: noFormat`print?.call(<Foo>{ bar: 5 });`,
      errors: [
        {
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
      code: noFormat`print\`\${<Foo>{ bar: 5 }}\`;`,
      errors: [
        {
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
      errors: [{ line: 1, messageId: 'never' }],
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      options: [{ assertionStyle: 'never' }],
      output: null,
    },
    {
      code: noFormat`const a = <any>(b, c);`,
      errors: [
        {
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
      code: noFormat`const f = <any>(() => {});`,
      errors: [
        {
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
      code: noFormat`const f = <any>function () {};`,
      errors: [
        {
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
      code: noFormat`const f = <any>(async () => {});`,
      errors: [
        {
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
      code: noFormat`
function* g() {
  const y = <any>(yield a);
}
      `,
      errors: [
        {
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
      code: noFormat`
declare let x: number, y: number;
const bs = <any>(x <<= y);
      `,
      errors: [
        {
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
      code: noFormat`const ternary = <any>(true ? x : y);`,
      errors: [
        {
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
      code: noFormat`const x = <string[]>[];`,
      errors: [
        {
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
      code: noFormat`const x = <string[]>[];`,
      errors: [
        {
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
      code: noFormat`const x = <string[]>[];`,
      errors: [
        {
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
      code: noFormat`new print(<Foo>[5]);`,
      errors: [
        {
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
      code: noFormat`function b(x = <Foo.Bar>[5]) {}`,
      errors: [
        {
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
      code: noFormat`
function foo() {
  throw <Foo>[5];
}
      `,
      errors: [
        {
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
      code: noFormat`print\`\${<Foo>[5]}\`;`,
      errors: [
        {
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
      code: noFormat`const foo = <Foo>[5];`,
      errors: [
        {
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
