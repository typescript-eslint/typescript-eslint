import rule from '../../src/rules/consistent-generic-constructors';
import { RuleTester, noFormat } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('consistent-generic-constructors', rule, {
  valid: [
    // default: constructor
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
    `
class Foo {
  a = new Foo<string>();
}
    `,
    // type-annotation
    {
      code: 'const a = new Foo();',
      options: ['type-annotation'],
    },
    {
      code: 'const a: Foo<string> = new Foo();',
      options: ['type-annotation'],
    },
    {
      code: 'const a: Foo<string> = new Foo<string>();',
      options: ['type-annotation'],
    },
    {
      code: 'const a: Foo = new Foo();',
      options: ['type-annotation'],
    },
    {
      code: 'const a: Bar = new Foo<string>();',
      options: ['type-annotation'],
    },
    {
      code: 'const a: Bar<string> = new Foo<string>();',
      options: ['type-annotation'],
    },
    {
      code: 'const a: Foo<string> = Foo<string>();',
      options: ['type-annotation'],
    },
    {
      code: 'const a: Foo<string> = Foo();',
      options: ['type-annotation'],
    },
    {
      code: 'const a: Foo = Foo<string>();',
      options: ['type-annotation'],
    },
    {
      code: 'const a = new (class C<T> {})<string>();',
      options: ['type-annotation'],
    },
    {
      code: `
class Foo {
  a: Foo<string> = new Foo();
}
      `,
      options: ['type-annotation'],
    },
  ],
  invalid: [
    {
      code: 'const a: Foo<string> = new Foo();',
      errors: [
        {
          messageId: 'preferConstructor',
        },
      ],
      output: 'const a = new Foo<string>();',
    },
    {
      code: 'const a: Map<string, number> = new Map();',
      errors: [
        {
          messageId: 'preferConstructor',
        },
      ],
      output: 'const a = new Map<string, number>();',
    },
    {
      code: noFormat`const a: Map <string, number> = new Map();`,
      errors: [
        {
          messageId: 'preferConstructor',
        },
      ],
      output: `const a = new Map<string, number>();`,
    },
    {
      code: noFormat`const a: Map< string, number > = new Map();`,
      errors: [
        {
          messageId: 'preferConstructor',
        },
      ],
      output: `const a = new Map< string, number >();`,
    },
    {
      code: noFormat`const a: Map<string, number> = new Map ();`,
      errors: [
        {
          messageId: 'preferConstructor',
        },
      ],
      output: `const a = new Map<string, number> ();`,
    },
    {
      code: noFormat`const a: Foo<number> = new Foo;`,
      errors: [
        {
          messageId: 'preferConstructor',
        },
      ],
      output: `const a = new Foo<number>();`,
    },
    {
      code: 'const a: /* comment */ Foo/* another */ <string> = new Foo();',
      errors: [
        {
          messageId: 'preferConstructor',
        },
      ],
      output: `const a = new Foo/* comment *//* another */<string>();`,
    },
    {
      code: 'const a: Foo/* comment */ <string> = new Foo /* another */();',
      errors: [
        {
          messageId: 'preferConstructor',
        },
      ],
      output: `const a = new Foo/* comment */<string> /* another */();`,
    },
    {
      code: noFormat`const a: Foo<string> = new \n Foo \n ();`,
      errors: [
        {
          messageId: 'preferConstructor',
        },
      ],
      output: `const a = new \n Foo<string> \n ();`,
    },
    {
      code: `
class Foo {
  a: Foo<string> = new Foo();
}
      `,
      errors: [
        {
          messageId: 'preferConstructor',
        },
      ],
      output: `
class Foo {
  a = new Foo<string>();
}
      `,
    },
    {
      code: `
class Foo {
  [a]: Foo<string> = new Foo();
}
      `,
      errors: [
        {
          messageId: 'preferConstructor',
        },
      ],
      output: `
class Foo {
  [a] = new Foo<string>();
}
      `,
    },
    {
      code: 'const a = new Foo<string>();',
      options: ['type-annotation'],
      errors: [
        {
          messageId: 'preferTypeAnnotation',
        },
      ],
      output: 'const a: Foo<string> = new Foo();',
    },
    {
      code: 'const a = new Map<string, number>();',
      options: ['type-annotation'],
      errors: [
        {
          messageId: 'preferTypeAnnotation',
        },
      ],
      output: 'const a: Map<string, number> = new Map();',
    },
    {
      code: noFormat`const a = new Map <string, number> ();`,
      options: ['type-annotation'],
      errors: [
        {
          messageId: 'preferTypeAnnotation',
        },
      ],
      output: `const a: Map<string, number> = new Map  ();`,
    },
    {
      code: noFormat`const a = new Map< string, number >();`,
      options: ['type-annotation'],
      errors: [
        {
          messageId: 'preferTypeAnnotation',
        },
      ],
      output: `const a: Map< string, number > = new Map();`,
    },
    {
      code: noFormat`const a = new \n Foo<string> \n ();`,
      options: ['type-annotation'],
      errors: [
        {
          messageId: 'preferTypeAnnotation',
        },
      ],
      output: `const a: Foo<string> = new \n Foo \n ();`,
    },
    {
      code: 'const a = new Foo/* comment */ <string> /* another */();',
      options: ['type-annotation'],
      errors: [
        {
          messageId: 'preferTypeAnnotation',
        },
      ],
      output: `const a: Foo<string> = new Foo/* comment */  /* another */();`,
    },
    {
      code: 'const a = new Foo</* comment */ string, /* another */ number>();',
      options: ['type-annotation'],
      errors: [
        {
          messageId: 'preferTypeAnnotation',
        },
      ],
      output: `const a: Foo</* comment */ string, /* another */ number> = new Foo();`,
    },
    {
      code: `
class Foo {
  a = new Foo<string>();
}
      `,
      options: ['type-annotation'],
      errors: [
        {
          messageId: 'preferTypeAnnotation',
        },
      ],
      output: `
class Foo {
  a: Foo<string> = new Foo();
}
      `,
    },
    {
      code: `
class Foo {
  [a] = new Foo<string>();
}
      `,
      options: ['type-annotation'],
      errors: [
        {
          messageId: 'preferTypeAnnotation',
        },
      ],
      output: `
class Foo {
  [a]: Foo<string> = new Foo();
}
      `,
    },
    {
      code: `
class Foo {
  [a + b] = new Foo<string>();
}
      `,
      options: ['type-annotation'],
      errors: [
        {
          messageId: 'preferTypeAnnotation',
        },
      ],
      output: `
class Foo {
  [a + b]: Foo<string> = new Foo();
}
      `,
    },
  ],
});
