import rule from '../../src/rules/consistent-type-assertions';
import { batchedSingleLineTests, RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const ANGLE_BRACKET_TESTS_EXCEPT_CONST_CASE = `
const x = <Foo>new Generic<int>();
const x = <A>b;
const x = <readonly number[]>[1];
const x = <a | b>('string');
const x = <A>!'string';
const x = <A>a + b;
const x = <(A)>a + (b);
const x = <Foo>(new Generic<string>());
const x = (new (<Foo>Generic<string>)());`;

const ANGLE_BRACKET_TESTS = `${ANGLE_BRACKET_TESTS_EXCEPT_CONST_CASE}
const x = <const>{ key: 'value' };
`;

const AS_TESTS_EXCEPT_CONST_CASE = `
const x = new Generic<int>() as Foo;
const x = b as A;
const x = [1] as readonly number[];
const x = ('string') as a | b;
const x = !'string' as A;
const x = a as A + b;
const x = a as (A) + (b);
const x = (new Generic<string>()) as Foo;
const x = (new (Generic<string> as Foo)());`;

const AS_TESTS = `${AS_TESTS_EXCEPT_CONST_CASE}
const x = { key: 'value' } as const;
`;

const OBJECT_LITERAL_AS_CASTS = `
const x = {} as Foo<int>;
`;
const OBJECT_LITERAL_ANGLE_BRACKET_CASTS = `
const x = <Foo<int>>{};
`;
const OBJECT_LITERAL_ARGUMENT_AS_CASTS = `
print({ bar: 5 } as Foo)
new print({ bar: 5 } as Foo)
function foo() { throw { bar: 5 } as Foo }
function b(x = {} as Foo.Bar) {}
function c(x = {} as Foo) {}
print?.({ bar: 5 } as Foo)
print?.call({ bar: 5 } as Foo)
`;
const OBJECT_LITERAL_ARGUMENT_ANGLE_BRACKET_CASTS = `
print(<Foo>{ bar: 5 })
new print(<Foo>{ bar: 5 })
function foo() { throw <Foo>{ bar: 5 } }
print?.(<Foo>{ bar: 5 })
print?.call(<Foo>{ bar: 5 })
`;

ruleTester.run('consistent-type-assertions', rule, {
  valid: [
    ...batchedSingleLineTests({
      code: AS_TESTS,
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: ANGLE_BRACKET_TESTS,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: `${OBJECT_LITERAL_AS_CASTS.trimEnd()}${OBJECT_LITERAL_ARGUMENT_AS_CASTS}`,
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: `${OBJECT_LITERAL_ANGLE_BRACKET_CASTS.trimEnd()}${OBJECT_LITERAL_ARGUMENT_ANGLE_BRACKET_CASTS}`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: OBJECT_LITERAL_ARGUMENT_AS_CASTS,
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: OBJECT_LITERAL_ARGUMENT_ANGLE_BRACKET_CASTS,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    }),
    {
      code: 'const x = <const>[1];',
      options: [
        {
          assertionStyle: 'never',
        },
      ],
    },
    {
      code: 'const x = [1] as const;',
      options: [
        {
          assertionStyle: 'never',
        },
      ],
    },
    {
      code: 'const bar = <Foo style={{ bar: 5 } as Bar} />;',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
    },
  ],
  invalid: [
    ...batchedSingleLineTests({
      code: AS_TESTS,
      options: [
        {
          assertionStyle: 'angle-bracket',
        },
      ],
      errors: [
        {
          messageId: 'angle-bracket',
          line: 2,
        },
        {
          messageId: 'angle-bracket',
          line: 3,
        },
        {
          messageId: 'angle-bracket',
          line: 4,
        },
        {
          messageId: 'angle-bracket',
          line: 5,
        },
        {
          messageId: 'angle-bracket',
          line: 6,
        },
        {
          messageId: 'angle-bracket',
          line: 7,
        },
        {
          messageId: 'angle-bracket',
          line: 8,
        },
        {
          messageId: 'angle-bracket',
          line: 9,
        },
        {
          messageId: 'angle-bracket',
          line: 10,
        },
        {
          messageId: 'angle-bracket',
          line: 11,
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: ANGLE_BRACKET_TESTS,
      options: [
        {
          assertionStyle: 'as',
        },
      ],
      errors: [
        {
          messageId: 'as',
          line: 2,
        },
        {
          messageId: 'as',
          line: 3,
        },
        {
          messageId: 'as',
          line: 4,
        },
        {
          messageId: 'as',
          line: 5,
        },
        {
          messageId: 'as',
          line: 6,
        },
        {
          messageId: 'as',
          line: 7,
        },
        {
          messageId: 'as',
          line: 8,
        },
        {
          messageId: 'as',
          line: 9,
        },
        {
          messageId: 'as',
          line: 10,
        },
        {
          messageId: 'as',
          line: 11,
        },
      ],
      output: AS_TESTS,
    }),
    ...batchedSingleLineTests({
      code: AS_TESTS_EXCEPT_CONST_CASE,
      options: [
        {
          assertionStyle: 'never',
        },
      ],
      errors: [
        {
          messageId: 'never',
          line: 2,
        },
        {
          messageId: 'never',
          line: 3,
        },
        {
          messageId: 'never',
          line: 4,
        },
        {
          messageId: 'never',
          line: 5,
        },
        {
          messageId: 'never',
          line: 6,
        },
        {
          messageId: 'never',
          line: 7,
        },
        {
          messageId: 'never',
          line: 8,
        },
        {
          messageId: 'never',
          line: 9,
        },
        {
          messageId: 'never',
          line: 10,
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: ANGLE_BRACKET_TESTS_EXCEPT_CONST_CASE,
      options: [
        {
          assertionStyle: 'never',
        },
      ],
      errors: [
        {
          messageId: 'never',
          line: 2,
        },
        {
          messageId: 'never',
          line: 3,
        },
        {
          messageId: 'never',
          line: 4,
        },
        {
          messageId: 'never',
          line: 5,
        },
        {
          messageId: 'never',
          line: 6,
        },
        {
          messageId: 'never',
          line: 7,
        },
        {
          messageId: 'never',
          line: 8,
        },
        {
          messageId: 'never',
          line: 9,
        },
        {
          messageId: 'never',
          line: 10,
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: OBJECT_LITERAL_AS_CASTS,
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
      errors: [
        {
          messageId: 'unexpectedObjectTypeAssertion',
          line: 2,
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: OBJECT_LITERAL_ANGLE_BRACKET_CASTS,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
      errors: [
        {
          messageId: 'unexpectedObjectTypeAssertion',
          line: 2,
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: `${OBJECT_LITERAL_AS_CASTS.trimEnd()}${OBJECT_LITERAL_ARGUMENT_AS_CASTS}`,
      options: [
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'never',
        },
      ],
      errors: [
        {
          messageId: 'unexpectedObjectTypeAssertion',
          line: 2,
        },
        {
          messageId: 'unexpectedObjectTypeAssertion',
          line: 3,
        },
        {
          messageId: 'unexpectedObjectTypeAssertion',
          line: 4,
        },
        {
          messageId: 'unexpectedObjectTypeAssertion',
          line: 5,
        },
        {
          messageId: 'unexpectedObjectTypeAssertion',
          line: 6,
        },
        {
          messageId: 'unexpectedObjectTypeAssertion',
          line: 7,
        },
        {
          messageId: 'unexpectedObjectTypeAssertion',
          line: 8,
        },
        {
          messageId: 'unexpectedObjectTypeAssertion',
          line: 9,
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: `${OBJECT_LITERAL_ANGLE_BRACKET_CASTS.trimEnd()}${OBJECT_LITERAL_ARGUMENT_ANGLE_BRACKET_CASTS}`,
      options: [
        {
          assertionStyle: 'angle-bracket',
          objectLiteralTypeAssertions: 'never',
        },
      ],
      errors: [
        {
          messageId: 'unexpectedObjectTypeAssertion',
          line: 2,
        },
        {
          messageId: 'unexpectedObjectTypeAssertion',
          line: 3,
        },
        {
          messageId: 'unexpectedObjectTypeAssertion',
          line: 4,
        },
        {
          messageId: 'unexpectedObjectTypeAssertion',
          line: 5,
        },
        {
          messageId: 'unexpectedObjectTypeAssertion',
          line: 6,
        },
        {
          messageId: 'unexpectedObjectTypeAssertion',
          line: 7,
        },
      ],
    }),
    {
      code: 'const foo = <Foo style={{ bar: 5 } as Bar} />;',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      options: [
        {
          assertionStyle: 'never',
        },
      ],
      errors: [
        {
          messageId: 'never',
          line: 1,
        },
      ],
    },
  ],
});
