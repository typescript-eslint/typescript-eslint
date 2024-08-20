import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/parameter-properties';

const ruleTester = new RuleTester();

ruleTester.run('parameter-properties', rule, {
  invalid: [
    {
      code: `
class Foo {
  constructor(readonly name: string) {}
}
      `,
      errors: [
        {
          column: 15,
          data: {
            parameter: 'name',
          },
          line: 3,
          messageId: 'preferClassProperty',
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
          column: 15,
          data: {
            parameter: 'name',
          },
          line: 3,
          messageId: 'preferClassProperty',
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
          column: 15,
          data: {
            parameter: 'name',
          },
          line: 3,
          messageId: 'preferClassProperty',
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
          column: 15,
          data: {
            parameter: 'name',
          },
          line: 3,
          messageId: 'preferClassProperty',
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
          column: 15,
          data: {
            parameter: 'name',
          },
          line: 3,
          messageId: 'preferClassProperty',
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
          column: 15,
          data: {
            parameter: 'name',
          },
          line: 3,
          messageId: 'preferClassProperty',
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
          column: 15,
          data: {
            parameter: 'name',
          },
          line: 3,
          messageId: 'preferClassProperty',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(
    public name: string,
    age: number,
  ) {}
}
      `,
      errors: [
        {
          column: 5,
          data: {
            parameter: 'name',
          },
          line: 4,
          messageId: 'preferClassProperty',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(
    private name: string,
    private age: number,
  ) {}
}
      `,
      errors: [
        {
          column: 5,
          data: {
            parameter: 'name',
          },
          line: 4,
          messageId: 'preferClassProperty',
        },
        {
          column: 5,
          data: {
            parameter: 'age',
          },
          line: 5,
          messageId: 'preferClassProperty',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(
    protected name: string,
    protected age: number,
  ) {}
}
      `,
      errors: [
        {
          column: 5,
          data: {
            parameter: 'name',
          },
          line: 4,
          messageId: 'preferClassProperty',
        },
        {
          column: 5,
          data: {
            parameter: 'age',
          },
          line: 5,
          messageId: 'preferClassProperty',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(
    public name: string,
    public age: number,
  ) {}
}
      `,
      errors: [
        {
          column: 5,
          data: {
            parameter: 'name',
          },
          line: 4,
          messageId: 'preferClassProperty',
        },
        {
          column: 5,
          data: {
            parameter: 'age',
          },
          line: 5,
          messageId: 'preferClassProperty',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(name: string) {}
  constructor(
    private name: string,
    age?: number,
  ) {}
}
      `,
      errors: [
        {
          column: 5,
          data: {
            parameter: 'name',
          },
          line: 5,
          messageId: 'preferClassProperty',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(private name: string) {}
  constructor(
    private name: string,
    age?: number,
  ) {}
}
      `,
      errors: [
        {
          column: 15,
          data: {
            parameter: 'name',
          },
          line: 3,
          messageId: 'preferClassProperty',
        },
        {
          column: 5,
          data: {
            parameter: 'name',
          },
          line: 5,
          messageId: 'preferClassProperty',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(private name: string) {}
  constructor(
    private name: string,
    private age?: number,
  ) {}
}
      `,
      errors: [
        {
          column: 15,
          data: {
            parameter: 'name',
          },
          line: 3,
          messageId: 'preferClassProperty',
        },
        {
          column: 5,
          data: {
            parameter: 'name',
          },
          line: 5,
          messageId: 'preferClassProperty',
        },
        {
          column: 5,
          data: {
            parameter: 'age',
          },
          line: 6,
          messageId: 'preferClassProperty',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(name: string) {}
  constructor(
    protected name: string,
    age?: number,
  ) {}
}
      `,
      errors: [
        {
          column: 5,
          data: {
            parameter: 'name',
          },
          line: 5,
          messageId: 'preferClassProperty',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(protected name: string) {}
  constructor(
    protected name: string,
    age?: number,
  ) {}
}
      `,
      errors: [
        {
          column: 15,
          data: {
            parameter: 'name',
          },
          line: 3,
          messageId: 'preferClassProperty',
        },
        {
          column: 5,
          data: {
            parameter: 'name',
          },
          line: 5,
          messageId: 'preferClassProperty',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(protected name: string) {}
  constructor(
    protected name: string,
    protected age?: number,
  ) {}
}
      `,
      errors: [
        {
          column: 15,
          data: {
            parameter: 'name',
          },
          line: 3,
          messageId: 'preferClassProperty',
        },
        {
          column: 5,
          data: {
            parameter: 'name',
          },
          line: 5,
          messageId: 'preferClassProperty',
        },
        {
          column: 5,
          data: {
            parameter: 'age',
          },
          line: 6,
          messageId: 'preferClassProperty',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(name: string) {}
  constructor(
    public name: string,
    age?: number,
  ) {}
}
      `,
      errors: [
        {
          column: 5,
          data: {
            parameter: 'name',
          },
          line: 5,
          messageId: 'preferClassProperty',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public name: string) {}
  constructor(
    public name: string,
    age?: number,
  ) {}
}
      `,
      errors: [
        {
          column: 15,
          data: {
            parameter: 'name',
          },
          line: 3,
          messageId: 'preferClassProperty',
        },
        {
          column: 5,
          data: {
            parameter: 'name',
          },
          line: 5,
          messageId: 'preferClassProperty',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public name: string) {}
  constructor(
    public name: string,
    public age?: number,
  ) {}
}
      `,
      errors: [
        {
          column: 15,
          data: {
            parameter: 'name',
          },
          line: 3,
          messageId: 'preferClassProperty',
        },
        {
          column: 5,
          data: {
            parameter: 'name',
          },
          line: 5,
          messageId: 'preferClassProperty',
        },
        {
          column: 5,
          data: {
            parameter: 'age',
          },
          line: 6,
          messageId: 'preferClassProperty',
        },
      ],
    },

    {
      code: `
class Foo {
  constructor(readonly name: string) {}
}
      `,
      errors: [
        {
          column: 15,
          data: {
            parameter: 'name',
          },
          line: 3,
          messageId: 'preferClassProperty',
        },
      ],
      options: [{ allow: ['private'] }],
    },
    {
      code: `
class Foo {
  constructor(private name: string) {}
}
      `,
      errors: [
        {
          column: 15,
          data: {
            parameter: 'name',
          },
          line: 3,
          messageId: 'preferClassProperty',
        },
      ],
      options: [{ allow: ['readonly'] }],
    },
    {
      code: `
class Foo {
  constructor(protected name: string) {}
}
      `,
      errors: [
        {
          column: 15,
          data: {
            parameter: 'name',
          },
          line: 3,
          messageId: 'preferClassProperty',
        },
      ],
      options: [
        {
          allow: ['readonly', 'private', 'public', 'protected readonly'],
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
          column: 15,
          data: {
            parameter: 'name',
          },
          line: 3,
          messageId: 'preferClassProperty',
        },
      ],
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
    },
    {
      code: `
class Foo {
  constructor(private readonly name: string) {}
}
      `,
      errors: [
        {
          column: 15,
          data: {
            parameter: 'name',
          },
          line: 3,
          messageId: 'preferClassProperty',
        },
      ],
      options: [{ allow: ['readonly', 'private'] }],
    },
    {
      code: `
class Foo {
  constructor(protected readonly name: string) {}
}
      `,
      errors: [
        {
          column: 15,
          data: {
            parameter: 'name',
          },
          line: 3,
          messageId: 'preferClassProperty',
        },
      ],
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
    },
    {
      code: `
class Foo {
  constructor(private name: string) {}
  constructor(
    private name: string,
    protected age?: number,
  ) {}
}
      `,
      errors: [
        {
          column: 5,
          data: {
            parameter: 'age',
          },
          line: 6,
          messageId: 'preferClassProperty',
        },
      ],
      options: [{ allow: ['private'] }],
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
          column: 3,
          data: {
            parameter: 'member',
          },
          line: 3,
          messageId: 'preferParameterProperty',
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
          column: 3,
          data: {
            parameter: 'member',
          },
          line: 7,
          messageId: 'preferParameterProperty',
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
          column: 3,
          data: {
            parameter: 'member',
          },
          line: 3,
          messageId: 'preferParameterProperty',
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
          column: 3,
          data: {
            parameter: 'member',
          },
          line: 3,
          messageId: 'preferParameterProperty',
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
  constructor(
    readonly name: string,
    private age: number,
  ) {}
}
      `,
      options: [{ allow: ['readonly', 'private'] }],
    },
    {
      code: `
class Foo {
  constructor(
    public readonly name: string,
    private age: number,
  ) {}
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
  constructor(
    private age: string,
    ...name: string[]
  ) {}
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
});
