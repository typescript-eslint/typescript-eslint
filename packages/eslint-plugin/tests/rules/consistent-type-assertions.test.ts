/* eslint-disable @typescript-eslint/no-deprecated -- TODO - migrate this test away from `batchedSingleLineTests` */

import type { TSESTree } from '@typescript-eslint/utils';

import * as parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';

import type {
  MessageIds,
  Options,
} from '../../src/rules/consistent-type-assertions';

import rule from '../../src/rules/consistent-type-assertions';
import { dedupeTestCases } from '../dedupeTestCases';
import { batchedSingleLineTests } from '../RuleTester';

const ruleTester = new RuleTester();

const ANGLE_BRACKET_TESTS_EXCEPT_CONST_CASE = `
const x = <Foo>new Generic<int>();
const x = <A>b;
const x = <readonly number[]>[1];
const x = <a | b>('string');
const x = <A>!'string';
const x = <A>a + b;
const x = <(A)>a + (b);
const x = <Foo>(new Generic<string>());
const x = new (<Foo>Generic<string>)();
const x = new (<Foo>Generic<string>)('string');
const x = () => <Foo>{ bar: 5 };
const x = () => <Foo>({ bar: 5 });
const x = () => <Foo>bar;
const x = <Foo>bar<string>\`\${"baz"}\`;`;

const ANGLE_BRACKET_TESTS = `${ANGLE_BRACKET_TESTS_EXCEPT_CONST_CASE}
const x = <const>{ key: 'value' };
`;

// Intentionally contains a duplicate in order to mirror ANGLE_BRACKET_TESTS_EXCEPT_CONST_CASE
const AS_TESTS_EXCEPT_CONST_CASE = `
const x = new Generic<int>() as Foo;
const x = b as A;
const x = [1] as readonly number[];
const x = 'string' as a | b;
const x = !'string' as A;
const x = (a as A) + b;
const x = (a as A) + (b);
const x = new Generic<string>() as Foo;
const x = new ((Generic<string>) as Foo)();
const x = new ((Generic<string>) as Foo)('string');
const x = () => ({ bar: 5 } as Foo);
const x = () => ({ bar: 5 } as Foo);
const x = () => (bar as Foo);
const x = bar<string>\`\${"baz"}\` as Foo;`;

const AS_TESTS = `${AS_TESTS_EXCEPT_CONST_CASE}
const x = { key: 'value' } as const;
`;

const OBJECT_LITERAL_AS_CASTS = `
const x = {} as Foo<int>;
const x = ({}) as a | b;
const x = {} as A + b;
`;
const OBJECT_LITERAL_ANGLE_BRACKET_CASTS = `
const x = <Foo<int>>{};
const x = <a | b>({});
const x = <A>{} + b;
`;
const OBJECT_LITERAL_ARGUMENT_AS_CASTS = `
print({ bar: 5 } as Foo)
new print({ bar: 5 } as Foo)
function foo() { throw { bar: 5 } as Foo }
function b(x = {} as Foo.Bar) {}
function c(x = {} as Foo) {}
print?.({ bar: 5 } as Foo)
print?.call({ bar: 5 } as Foo)
print\`\${{ bar: 5 } as Foo}\`
`;
const OBJECT_LITERAL_ARGUMENT_ANGLE_BRACKET_CASTS = `
print(<Foo>{ bar: 5 })
new print(<Foo>{ bar: 5 })
function foo() { throw <Foo>{ bar: 5 } }
print?.(<Foo>{ bar: 5 })
print?.call(<Foo>{ bar: 5 })
print\`\${<Foo>{ bar: 5 }}\`
`;

ruleTester.run('consistent-type-assertions', rule, {
  valid: [
    ...dedupeTestCases(
      batchedSingleLineTests<Options>({
        code: AS_TESTS,
        options: [
          { assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' },
        ],
      }),
    ),
    ...batchedSingleLineTests<Options>({
      code: ANGLE_BRACKET_TESTS,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    }),
    ...batchedSingleLineTests<Options>({
      code: `${OBJECT_LITERAL_AS_CASTS.trimEnd()}${OBJECT_LITERAL_ARGUMENT_AS_CASTS}`,
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' }],
    }),
    ...batchedSingleLineTests<Options>({
      code: `${OBJECT_LITERAL_ANGLE_BRACKET_CASTS.trimEnd()}${OBJECT_LITERAL_ARGUMENT_ANGLE_BRACKET_CASTS}`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    }),
    ...batchedSingleLineTests<Options>({
      code: OBJECT_LITERAL_ARGUMENT_AS_CASTS,
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    }),
    ...batchedSingleLineTests<Options>({
      code: OBJECT_LITERAL_ARGUMENT_ANGLE_BRACKET_CASTS,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    }),
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
    ...dedupeTestCases(
      (
        [
          ['angle-bracket', AS_TESTS],
          ['as', ANGLE_BRACKET_TESTS, AS_TESTS],
          ['never', AS_TESTS_EXCEPT_CONST_CASE],
          ['never', ANGLE_BRACKET_TESTS_EXCEPT_CONST_CASE],
        ] as const
      ).flatMap(([assertionStyle, code, output]) =>
        batchedSingleLineTests<MessageIds, Options>({
          code,
          errors: code
            .split(`\n`)
            .map((_, i) => ({ line: i + 1, messageId: assertionStyle })),
          options: [{ assertionStyle }],
          output,
        }),
      ),
    ),
    ...batchedSingleLineTests<MessageIds, Options>({
      code: OBJECT_LITERAL_AS_CASTS,
      errors: [
        {
          line: 2,
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
        {
          line: 3,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'a | b' },
              messageId: 'replaceObjectTypeAssertionWithAnnotation',
              output: 'const x: a | b = ({});',
            },
            {
              data: { cast: 'a | b' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'const x = ({}) satisfies a | b;',
            },
          ],
        },
        {
          line: 4,
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
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    }),
    ...batchedSingleLineTests<MessageIds, Options>({
      code: OBJECT_LITERAL_ANGLE_BRACKET_CASTS,
      errors: [
        {
          line: 2,
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
        {
          line: 3,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'a | b' },
              messageId: 'replaceObjectTypeAssertionWithAnnotation',
              output: 'const x: a | b = ({});',
            },
            {
              data: { cast: 'a | b' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'const x = ({}) satisfies a | b;',
            },
          ],
        },
        {
          line: 4,
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
    }),
    ...batchedSingleLineTests<MessageIds, Options>({
      code: `${OBJECT_LITERAL_AS_CASTS.trimEnd()}${OBJECT_LITERAL_ARGUMENT_AS_CASTS}`,
      errors: [
        {
          line: 2,
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
        {
          line: 3,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'a | b' },
              messageId: 'replaceObjectTypeAssertionWithAnnotation',
              output: 'const x: a | b = ({});',
            },
            {
              data: { cast: 'a | b' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'const x = ({}) satisfies a | b;',
            },
          ],
        },
        {
          line: 4,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'A' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'const x = {} satisfies A + b;',
            },
          ],
        },
        {
          line: 5,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'print({ bar: 5 } satisfies Foo)',
            },
          ],
        },
        {
          line: 6,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'new print({ bar: 5 } satisfies Foo)',
            },
          ],
        },
        {
          line: 7,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'function foo() { throw { bar: 5 } satisfies Foo }',
            },
          ],
        },
        {
          line: 8,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo.Bar' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'function b(x = {} satisfies Foo.Bar) {}',
            },
          ],
        },
        {
          line: 9,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'function c(x = {} satisfies Foo) {}',
            },
          ],
        },
        {
          line: 10,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'print?.({ bar: 5 } satisfies Foo)',
            },
          ],
        },
        {
          line: 11,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'print?.call({ bar: 5 } satisfies Foo)',
            },
          ],
        },
        {
          line: 12,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: `print\`\${{ bar: 5 } satisfies Foo}\``,
            },
          ],
        },
      ],
      options: [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
    }),
    ...batchedSingleLineTests<MessageIds, Options>({
      code: `${OBJECT_LITERAL_ANGLE_BRACKET_CASTS.trimEnd()}${OBJECT_LITERAL_ARGUMENT_ANGLE_BRACKET_CASTS}`,
      errors: [
        {
          line: 2,
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
        {
          line: 3,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'a | b' },
              messageId: 'replaceObjectTypeAssertionWithAnnotation',
              output: 'const x: a | b = ({});',
            },
            {
              data: { cast: 'a | b' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'const x = ({}) satisfies a | b;',
            },
          ],
        },
        {
          line: 4,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'A' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'const x = {} satisfies A + b;',
            },
          ],
        },
        {
          line: 5,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'print({ bar: 5 } satisfies Foo)',
            },
          ],
        },
        {
          line: 6,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'new print({ bar: 5 } satisfies Foo)',
            },
          ],
        },
        {
          line: 7,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'function foo() { throw { bar: 5 } satisfies Foo }',
            },
          ],
        },
        {
          line: 8,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'print?.({ bar: 5 } satisfies Foo)',
            },
          ],
        },
        {
          line: 9,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: 'print?.call({ bar: 5 } satisfies Foo)',
            },
          ],
        },
        {
          line: 10,
          messageId: 'unexpectedObjectTypeAssertion',
          suggestions: [
            {
              data: { cast: 'Foo' },
              messageId: 'replaceObjectTypeAssertionWithSatisfies',
              output: `print\`\${{ bar: 5 } satisfies Foo}\``,
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
    }),
    {
      code: 'const foo = <Foo style={{ bar: 5 } as Bar} />;',
      errors: [{ line: 1, messageId: 'never' }],
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      options: [{ assertionStyle: 'never' }],
      output: null,
    },
    {
      code: 'const a = <any>(b, c);',
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
      code: 'const f = <any>(() => {});',
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
      code: 'const f = <any>function () {};',
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
      code: 'const f = <any>(async () => {});',
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
      code: `
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
      code: `
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
      code: 'const ternary = <any>(true ? x : y);',
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
      code: 'const x = <string[]>[];',
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
      code: 'const x = <string[]>[];',
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
      code: 'const x = <string[]>[];',
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
      code: 'new print(<Foo>[5]);',
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
      code: 'function b(x = <Foo.Bar>[5]) {}',
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
      code: `
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
      code: 'print`${<Foo>[5]}`;',
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
      code: 'const foo = <Foo>[5];',
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
