/* eslint-disable eslint-comments/no-use */
// this rule tests the new lines, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */
import rule from '../../src/rules/comma-dangle';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('comma-dangle', rule, {
  valid: [
    // default
    { code: 'enum Foo {Bar}' },
    { code: 'function Foo<T>() {}' },

    // never
    { code: 'enum Foo {Bar}', options: ['never'] },
    { code: 'enum Foo {Bar\n}', options: ['never'] },
    { code: 'enum Foo {Bar\n}', options: [{ enums: 'never' }] },
    { code: 'function Foo<T>() {}', options: ['never'] },
    { code: 'function Foo<T\n>() {}', options: ['never'] },
    { code: 'function Foo<T\n>() {}', options: [{ generics: 'never' }] },
    { code: 'type Foo = [string]', options: ['never'] },
    { code: 'type Foo = [string]', options: [{ tuples: 'never' }] },

    // always
    { code: 'enum Foo {Bar,}', options: ['always'] },
    { code: 'enum Foo {Bar,\n}', options: ['always'] },
    { code: 'enum Foo {Bar,\n}', options: [{ enums: 'always' }] },
    { code: 'function Foo<T,>() {}', options: ['always'] },
    { code: 'function Foo<T,\n>() {}', options: ['always'] },
    { code: 'function Foo<T,\n>() {}', options: [{ generics: 'always' }] },
    { code: 'type Foo = [string,]', options: ['always'] },
    { code: 'type Foo = [string,\n]', options: [{ tuples: 'always' }] },

    // always-multiline
    { code: 'enum Foo {Bar,\n}', options: ['always-multiline'] },
    { code: 'enum Foo {Bar,\n}', options: [{ enums: 'always-multiline' }] },
    { code: 'function Foo<T,\n>() {}', options: ['always-multiline'] },
    {
      code: 'function Foo<T,\n>() {}',
      options: [{ generics: 'always-multiline' }],
    },
    { code: 'type Foo = [string,\n]', options: ['always-multiline'] },
    {
      code: 'type Foo = [string,\n]',
      options: [{ tuples: 'always-multiline' }],
    },

    // only-multiline
    { code: 'enum Foo {Bar}', options: ['only-multiline'] },
    { code: 'enum Foo {Bar\n}', options: ['only-multiline'] },
    { code: 'enum Foo {Bar,\n}', options: ['only-multiline'] },
    { code: 'enum Foo {Bar,\n}', options: [{ enums: 'only-multiline' }] },
    { code: 'function Foo<T>() {}', options: ['only-multiline'] },
    { code: 'function Foo<T\n>() {}', options: ['only-multiline'] },
    { code: 'function Foo<T,\n>() {}', options: ['only-multiline'] },
    {
      code: 'function Foo<T\n>() {}',
      options: [{ generics: 'only-multiline' }],
    },
    {
      code: 'function Foo<T,\n>() {}',
      options: [{ generics: 'only-multiline' }],
    },
    { code: 'type Foo = [string\n]', options: [{ tuples: 'only-multiline' }] },
    { code: 'type Foo = [string,\n]', options: [{ tuples: 'only-multiline' }] },

    // each options
    {
      code: `
const Obj = { a: 1 };
enum Foo {Bar}
function Baz<T,>() {}
type Qux = [string,
]
      `,
      options: [
        {
          enums: 'never',
          generics: 'always',
          tuples: 'always-multiline',
        },
      ],
    },
  ],
  invalid: [
    // default
    {
      code: 'enum Foo {Bar,}',
      output: 'enum Foo {Bar}',
      errors: [{ messageId: 'unexpected' }],
    },
    {
      code: 'function Foo<T,>() {}',
      output: 'function Foo<T>() {}',
      errors: [{ messageId: 'unexpected' }],
    },
    {
      code: 'type Foo = [string,]',
      output: 'type Foo = [string]',
      errors: [{ messageId: 'unexpected' }],
    },

    // never
    {
      code: 'enum Foo {Bar,}',
      output: 'enum Foo {Bar}',
      options: ['never'],
      errors: [{ messageId: 'unexpected' }],
    },
    {
      code: 'enum Foo {Bar,\n}',
      output: 'enum Foo {Bar\n}',
      options: ['never'],
      errors: [{ messageId: 'unexpected' }],
    },
    {
      code: 'function Foo<T,>() {}',
      output: 'function Foo<T>() {}',
      options: ['never'],
      errors: [{ messageId: 'unexpected' }],
    },
    {
      code: 'function Foo<T,\n>() {}',
      output: 'function Foo<T\n>() {}',
      options: ['never'],
      errors: [{ messageId: 'unexpected' }],
    },
    {
      code: 'type Foo = [string,]',
      output: 'type Foo = [string]',
      options: ['never'],
      errors: [{ messageId: 'unexpected' }],
    },
    {
      code: 'type Foo = [string,\n]',
      output: 'type Foo = [string\n]',
      options: ['never'],
      errors: [{ messageId: 'unexpected' }],
    },

    // always
    {
      code: 'enum Foo {Bar}',
      output: 'enum Foo {Bar,}',
      options: ['always'],
      errors: [{ messageId: 'missing' }],
    },
    {
      code: 'enum Foo {Bar\n}',
      output: 'enum Foo {Bar,\n}',
      options: ['always'],
      errors: [{ messageId: 'missing' }],
    },
    {
      code: 'function Foo<T>() {}',
      output: 'function Foo<T,>() {}',
      options: ['always'],
      errors: [{ messageId: 'missing' }],
    },
    {
      code: 'function Foo<T\n>() {}',
      output: 'function Foo<T,\n>() {}',
      options: ['always'],
      errors: [{ messageId: 'missing' }],
    },
    {
      code: 'type Foo = [string]',
      output: 'type Foo = [string,]',
      options: ['always'],
      errors: [{ messageId: 'missing' }],
    },
    {
      code: 'type Foo = [string\n]',
      output: 'type Foo = [string,\n]',
      options: ['always'],
      errors: [{ messageId: 'missing' }],
    },

    // always-multiline
    {
      code: 'enum Foo {Bar\n}',
      output: 'enum Foo {Bar,\n}',
      options: ['always-multiline'],
      errors: [{ messageId: 'missing' }],
    },
    {
      code: 'function Foo<T\n>() {}',
      output: 'function Foo<T,\n>() {}',
      options: ['always-multiline'],
      errors: [{ messageId: 'missing' }],
    },
    {
      code: 'type Foo = [string\n]',
      output: 'type Foo = [string,\n]',
      options: ['always-multiline'],
      errors: [{ messageId: 'missing' }],
    },

    // only-multiline
    {
      code: 'enum Foo {Bar,}',
      output: 'enum Foo {Bar}',
      options: ['only-multiline'],
      errors: [{ messageId: 'unexpected' }],
    },
    {
      code: 'function Foo<T,>() {}',
      output: 'function Foo<T>() {}',
      options: ['only-multiline'],
      errors: [{ messageId: 'unexpected' }],
    },
    {
      code: 'type Foo = [string,]',
      output: 'type Foo = [string]',
      options: ['only-multiline'],
      errors: [{ messageId: 'unexpected' }],
    },
  ],
});
