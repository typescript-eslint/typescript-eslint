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
    {
      code: `
class Foo {
  constructor(name: string) {}
}
      `,
      options: [{ prefer: 'class-property' }],
    },
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
  constructor(name: string) {}
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
    {
      code: `
class Foo {
  constructor(private name: string[]) {}
}
      `,
      options: [{ prefer: 'parameter-property' }],
    },
    {
      code: `
class Foo {
  constructor(...name: string[]) {}
}
      `,
      options: [{ prefer: 'parameter-property' }],
    },
    {
      code: `
class Foo {
  constructor(age: string, ...name: string[]) {}
}
      `,
      options: [{ prefer: 'parameter-property' }],
    },
    {
      code: `
class Foo {
  constructor(private age: string, ...name: string[]) {}
}
      `,
      options: [{ prefer: 'parameter-property' }],
    },
    {
      code: `
class Foo {
  public age: number;
  constructor(age: string) {
    this.age = age;
  }
}
      `,
      options: [{ prefer: 'parameter-property' }],
    },
    {
      code: `
class Foo {
  public age = '';
  constructor(age: string) {
    this.age = age;
  }
}
      `,
      options: [{ prefer: 'parameter-property' }],
    },
    {
      code: `
class Foo {
  public age;
  constructor(age: string) {
    this.age = age;
  }
}
      `,
      options: [{ prefer: 'parameter-property' }],
    },
    {
      code: `
class Foo {
  public age: string;
  constructor(age) {
    this.age = age;
  }
}
      `,
      options: [{ prefer: 'parameter-property' }],
    },
    {
      code: `
class Foo {
  public age: string;
  constructor(age: string) {
    console.log('unrelated');
    this.age = age;
  }
}
      `,
      options: [{ prefer: 'parameter-property' }],
    },
    {
      code: `
class Foo {
  other: string;
  constructor(age: string) {
    this.other = age;
  }
}
      `,
      options: [{ prefer: 'parameter-property' }],
    },
    {
      code: `
class Foo {
  age: string;
  constructor(age: string) {
    this.age = '';
    console.log(age);
  }
}
      `,
      options: [{ prefer: 'parameter-property' }],
    },
    {
      code: `
class Foo {
  age() {
    return '';
  }
  constructor(age: string) {
    this.age = age;
  }
}
      `,
      options: [{ prefer: 'parameter-property' }],
    },
    {
      code: `
class Foo {
  public age: string;
  constructor(age: string) {
    this.age = age;
  }
}
      `,
      options: [{ allow: ['public'], prefer: 'parameter-property' }],
    },
    {
      code: `
class Foo {
  public readonly age: string;
  constructor(age: string) {
    this.age = age;
  }
}
      `,
      options: [{ allow: ['public readonly'], prefer: 'parameter-property' }],
    },
    {
      code: `
class Foo {
  protected age: string;
  constructor(age: string) {
    this.age = age;
  }
}
      `,
      options: [{ allow: ['protected'], prefer: 'parameter-property' }],
    },
    {
      code: `
class Foo {
  protected readonly age: string;
  constructor(age: string) {
    this.age = age;
  }
}
      `,
      options: [
        { allow: ['protected readonly'], prefer: 'parameter-property' },
      ],
    },
    {
      code: `
class Foo {
  private age: string;
  constructor(age: string) {
    this.age = age;
  }
}
      `,
      options: [{ allow: ['private'], prefer: 'parameter-property' }],
    },
    {
      code: `
class Foo {
  private readonly age: string;
  constructor(age: string) {
    this.age = age;
  }
}
      `,
      options: [{ allow: ['private readonly'], prefer: 'parameter-property' }],
    },
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
  constructor(name: string) {}
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
  constructor(private name: string) {}
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
  constructor(private name: string) {}
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
  constructor(name: string) {}
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
  constructor(protected name: string) {}
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
  constructor(protected name: string) {}
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
  constructor(name: string) {}
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
  constructor(public name: string) {}
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
  constructor(public name: string) {}
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
  constructor(private name: string) {}
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
      options: [{ prefer: 'parameter-property' }],
    },
    {
      code: `
class Foo {
  constructor(member: string) {
    this.member = member;
  }

  member: string;
}
      `,
      errors: [
        {
          messageId: 'preferParameterProperty',
          data: {
            parameter: 'member',
          },
          line: 7,
          column: 3,
        },
      ],
      options: [{ prefer: 'parameter-property' }],
    },
    {
      code: `
class Foo {
  member;
  constructor(member) {
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
      options: [{ prefer: 'parameter-property' }],
    },
    {
      code: `
class Foo {
  public member: string;
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
      options: [
        {
          allow: ['protected', 'private', 'readonly'],
          prefer: 'parameter-property',
        },
      ],
    },
  ],
});
