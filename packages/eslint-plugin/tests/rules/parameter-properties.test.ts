import rule from '../../src/rules/parameter-properties';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('parameter-properties', rule, {
  valid: [
    `
class Foo {
  constructor(name: string) {}
}
    `,
    `
class Foo {
  constructor(...name: string[]) {}
}
    `,
    `
class Foo {
  constructor(name: string, age: number) {}
}
    `,
    `
class Foo {
  constructor(name: string);
  constructor(name: string, age?: number) {}
}
    `,
    {
      code: `
class Foo {
  constructor(readonly name: string) {}
}
      `,
      options: [{ allow: ['readonly'] }],
    },
    {
      code: `
class Foo {
  constructor(private name: string) {}
}
      `,
      options: [{ allow: ['private'] }],
    },
    {
      code: `
class Foo {
  constructor(protected name: string) {}
}
      `,
      options: [{ allow: ['protected'] }],
    },
    {
      code: `
class Foo {
  constructor(public name: string) {}
}
      `,
      options: [{ allow: ['public'] }],
    },
    {
      code: `
class Foo {
  constructor(private readonly name: string) {}
}
      `,
      options: [{ allow: ['private readonly'] }],
    },
    {
      code: `
class Foo {
  constructor(protected readonly name: string) {}
}
      `,
      options: [{ allow: ['protected readonly'] }],
    },
    {
      code: `
class Foo {
  constructor(public readonly name: string) {}
}
      `,
      options: [{ allow: ['public readonly'] }],
    },
    {
      code: `
class Foo {
  constructor(readonly name: string, private age: number) {}
}
      `,
      options: [{ allow: ['readonly', 'private'] }],
    },
    {
      code: `
class Foo {
  constructor(public readonly name: string, private age: number) {}
}
      `,
      options: [{ allow: ['public readonly', 'private'] }],
    },
    // Semantically invalid test case
    `
class Foo {
  constructor(private ...name: string[]) {}
}
    `,
    // Semantically invalid test case
    `
class Foo {
  constructor(private [test]: [string]) {}
}
    `,
  ],
  invalid: [
    {
      code: `
class Foo {
  constructor(readonly name: string) {}
}
      `,
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(private name: string) {}
}
      `,
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(protected name: string) {}
}
      `,
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public name: string) {}
}
      `,
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(private readonly name: string) {}
}
      `,
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(protected readonly name: string) {}
}
      `,
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public readonly name: string) {}
}
      `,
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public name: string, age: number) {}
}
      `,
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(private name: string, private age: number) {}
}
      `,
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'age',
          },
          line: 3,
          column: 37,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(protected name: string, protected age: number) {}
}
      `,
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'age',
          },
          line: 3,
          column: 39,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public name: string, public age: number) {}
}
      `,
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'age',
          },
          line: 3,
          column: 36,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(name: string);
  constructor(private name: string, age?: number) {}
}
      `,
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 4,
          column: 15,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(private name: string);
  constructor(private name: string, age?: number) {}
}
      `,
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 4,
          column: 15,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(private name: string);
  constructor(private name: string, private age?: number) {}
}
      `,
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 4,
          column: 15,
        },
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'age',
          },
          line: 4,
          column: 37,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(name: string);
  constructor(protected name: string, age?: number) {}
}
      `,
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 4,
          column: 15,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(protected name: string);
  constructor(protected name: string, age?: number) {}
}
      `,
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 4,
          column: 15,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(protected name: string);
  constructor(protected name: string, protected age?: number) {}
}
      `,
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 4,
          column: 15,
        },
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'age',
          },
          line: 4,
          column: 39,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(name: string);
  constructor(public name: string, age?: number) {}
}
      `,
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 4,
          column: 15,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public name: string);
  constructor(public name: string, age?: number) {}
}
      `,
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 4,
          column: 15,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public name: string);
  constructor(public name: string, public age?: number) {}
}
      `,
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 4,
          column: 15,
        },
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'age',
          },
          line: 4,
          column: 36,
        },
      ],
    },

    {
      code: `
class Foo {
  constructor(readonly name: string) {}
}
      `,
      options: [{ allow: ['private'] }],
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(private name: string) {}
}
      `,
      options: [{ allow: ['readonly'] }],
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(protected name: string) {}
}
      `,
      options: [
        {
          allow: ['readonly', 'private', 'public', 'protected readonly'],
        },
      ],
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public name: string) {}
}
      `,
      options: [
        {
          allow: [
            'readonly',
            'private',
            'protected',
            'protected readonly',
            'public readonly',
          ],
        },
      ],
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(private readonly name: string) {}
}
      `,
      options: [{ allow: ['readonly', 'private'] }],
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(protected readonly name: string) {}
}
      `,
      options: [
        {
          allow: [
            'readonly',
            'protected',
            'private readonly',
            'public readonly',
          ],
        },
      ],
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(private name: string);
  constructor(private name: string, protected age?: number) {}
}
      `,
      options: [{ allow: ['private'] }],
      errors: [
        {
          messageId: 'preferClassProperty',
          data: {
            parameter: 'age',
          },
          line: 4,
          column: 37,
        },
      ],
    },
    {
      code: `
class Foo {
  member: string;

  constructor(member: string) {
    this.member = member;
  }
}
      `,
      errors: [
        {
          messageId: 'preferParameterProperty',
          data: {
            parameter: 'member',
          },
          line: 3,
          column: 3,
        },
      ],
      only: true,
      options: [{ prefer: 'parameter-property' }],
    },
  ],
});
