import rule from '../../src/rules/no-parameter-properties';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-parameter-properties', rule, {
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
      options: [{ allows: ['readonly'] }],
    },
    {
      code: `
class Foo {
  constructor(private name: string) {}
}
      `,
      options: [{ allows: ['private'] }],
    },
    {
      code: `
class Foo {
  constructor(protected name: string) {}
}
      `,
      options: [{ allows: ['protected'] }],
    },
    {
      code: `
class Foo {
  constructor(public name: string) {}
}
      `,
      options: [{ allows: ['public'] }],
    },
    {
      code: `
class Foo {
  constructor(private readonly name: string) {}
}
      `,
      options: [{ allows: ['private readonly'] }],
    },
    {
      code: `
class Foo {
  constructor(protected readonly name: string) {}
}
      `,
      options: [{ allows: ['protected readonly'] }],
    },
    {
      code: `
class Foo {
  constructor(public readonly name: string) {}
}
      `,
      options: [{ allows: ['public readonly'] }],
    },
    {
      code: `
class Foo {
  constructor(readonly name: string, private age: number) {}
}
      `,
      options: [{ allows: ['readonly', 'private'] }],
    },
    {
      code: `
class Foo {
  constructor(public readonly name: string, private age: number) {}
}
      `,
      options: [{ allows: ['public readonly', 'private'] }],
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
          messageId: 'noParamProp',
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
          messageId: 'noParamProp',
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
          messageId: 'noParamProp',
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
          messageId: 'noParamProp',
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
          messageId: 'noParamProp',
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
          messageId: 'noParamProp',
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
          messageId: 'noParamProp',
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
          messageId: 'noParamProp',
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
          messageId: 'noParamProp',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
        {
          messageId: 'noParamProp',
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
          messageId: 'noParamProp',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
        {
          messageId: 'noParamProp',
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
          messageId: 'noParamProp',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
        {
          messageId: 'noParamProp',
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
          messageId: 'noParamProp',
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
          messageId: 'noParamProp',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
        {
          messageId: 'noParamProp',
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
          messageId: 'noParamProp',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
        {
          messageId: 'noParamProp',
          data: {
            parameter: 'name',
          },
          line: 4,
          column: 15,
        },
        {
          messageId: 'noParamProp',
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
          messageId: 'noParamProp',
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
          messageId: 'noParamProp',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
        {
          messageId: 'noParamProp',
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
          messageId: 'noParamProp',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
        {
          messageId: 'noParamProp',
          data: {
            parameter: 'name',
          },
          line: 4,
          column: 15,
        },
        {
          messageId: 'noParamProp',
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
          messageId: 'noParamProp',
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
          messageId: 'noParamProp',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
        {
          messageId: 'noParamProp',
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
          messageId: 'noParamProp',
          data: {
            parameter: 'name',
          },
          line: 3,
          column: 15,
        },
        {
          messageId: 'noParamProp',
          data: {
            parameter: 'name',
          },
          line: 4,
          column: 15,
        },
        {
          messageId: 'noParamProp',
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
      options: [{ allows: ['private'] }],
      errors: [
        {
          messageId: 'noParamProp',
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
      options: [{ allows: ['readonly'] }],
      errors: [
        {
          messageId: 'noParamProp',
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
          allows: ['readonly', 'private', 'public', 'protected readonly'],
        },
      ],
      errors: [
        {
          messageId: 'noParamProp',
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
          allows: [
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
          messageId: 'noParamProp',
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
      options: [{ allows: ['readonly', 'private'] }],
      errors: [
        {
          messageId: 'noParamProp',
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
          allows: [
            'readonly',
            'protected',
            'private readonly',
            'public readonly',
          ],
        },
      ],
      errors: [
        {
          messageId: 'noParamProp',
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
      options: [{ allows: ['private'] }],
      errors: [
        {
          messageId: 'noParamProp',
          data: {
            parameter: 'age',
          },
          line: 4,
          column: 37,
        },
      ],
    },
  ],
});
