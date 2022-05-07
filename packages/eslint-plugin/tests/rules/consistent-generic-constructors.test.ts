import rule from '../../src/rules/consistent-generic-constructors';
import { RuleTester, noFormat } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('consistent-generic-constructors', rule, {
  valid: [
    // default: rhs
    'const a = new Foo();',
    'const a = new Foo<string>();',
    'const a: Foo<string> = new Foo<string>();',
    'const a: Foo = new Foo();',
    'const a: Bar<string> = new Foo();',
    'const a: Foo = new Foo<string>();',
    'const a: Bar = new Foo<string>();',
    'const a: Bar<string> = new Foo<string>();',
    'const a: Foo<string> = Foo<string>();',
    'const a: Foo<string> = Foo();',
    'const a: Foo = Foo<string>();',
    // lhs
    {
      code: 'const a = new Foo();',
      options: ['lhs'],
    },
    {
      code: 'const a: Foo<string> = new Foo();',
      options: ['lhs'],
    },
    {
      code: 'const a: Foo<string> = new Foo<string>();',
      options: ['lhs'],
    },
    {
      code: 'const a: Foo = new Foo();',
      options: ['lhs'],
    },
    {
      code: 'const a: Bar = new Foo<string>();',
      options: ['lhs'],
    },
    {
      code: 'const a: Bar<string> = new Foo<string>();',
      options: ['lhs'],
    },
    {
      code: 'const a: Foo<string> = Foo<string>();',
      options: ['lhs'],
    },
    {
      code: 'const a: Foo<string> = Foo();',
      options: ['lhs'],
    },
    {
      code: 'const a: Foo = Foo<string>();',
      options: ['lhs'],
    },
    {
      code: 'const a = new (class C<T> {})<string>();',
      options: ['lhs'],
    },
  ],
  invalid: [
    {
      code: 'const a: Foo<string> = new Foo();',
      errors: [
        {
          messageId: 'preferRHS',
        },
      ],
      output: 'const a = new Foo<string>();',
    },
    {
      code: 'const a: Map<string, number> = new Map();',
      errors: [
        {
          messageId: 'preferRHS',
        },
      ],
      output: 'const a = new Map<string, number>();',
    },
    {
      code: noFormat`const a: Map <string, number> = new Map();`,
      errors: [
        {
          messageId: 'preferRHS',
        },
      ],
      output: noFormat`const a = new Map<string, number>();`,
    },
    {
      code: noFormat`const a: Map< string, number > = new Map();`,
      errors: [
        {
          messageId: 'preferRHS',
        },
      ],
      output: noFormat`const a = new Map< string, number >();`,
    },
    {
      code: noFormat`const a: Map<string, number> = new Map ();`,
      errors: [
        {
          messageId: 'preferRHS',
        },
      ],
      output: noFormat`const a = new Map<string, number> ();`,
    },
    {
      code: 'const a = new Foo<string>();',
      options: ['lhs'],
      errors: [
        {
          messageId: 'preferLHS',
        },
      ],
      output: 'const a: Foo<string> = new Foo();',
    },
    {
      code: 'const a = new Map<string, number>();',
      options: ['lhs'],
      errors: [
        {
          messageId: 'preferLHS',
        },
      ],
      output: 'const a: Map<string, number> = new Map();',
    },
    {
      code: noFormat`const a = new Map <string, number> ();`,
      options: ['lhs'],
      errors: [
        {
          messageId: 'preferLHS',
        },
      ],
      output: noFormat`const a: Map<string, number> = new Map  ();`,
    },
    {
      code: noFormat`const a = new Map< string, number >();`,
      options: ['lhs'],
      errors: [
        {
          messageId: 'preferLHS',
        },
      ],
      output: noFormat`const a: Map< string, number > = new Map();`,
    },
  ],
});
