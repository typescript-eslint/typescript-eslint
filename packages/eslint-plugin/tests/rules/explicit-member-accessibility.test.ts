import rule from '../../src/rules/explicit-member-accessibility';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('explicit-member-accessibility', rule, {
  valid: [
    {
      filename: 'test.ts',
      code: `
class Test {
  protected name: string
  private x: number
  public getX () {
    return this.x
  }
}
            `,
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  protected name: string
  protected foo?: string
  public "foo-bar"?: string
}
            `,
    },
    {
      filename: 'test.js',
      code: `
class Test {
  getX () {
    return 1;
  }
}
            `,
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  protected name: string
  protected foo?: string
  public getX () {
    return this.x
  }
}
            `,
      options: [{ noPublic: false }],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  protected name: string
  protected foo?: string
  getX () {
    return this.x
  }
}
            `,
      options: [{ noPublic: true }],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  name: string
  foo?: string
  getX () {
    return this.x
  }
  get fooName(): string {
    return this.foo + ' ' + this.name
  }
}
            `,
      options: [{ noPublic: true }],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  private x: number;
  constructor (x: number) {
    this.x = x;
  }
  get internalValue() {
    return this.x;
  }
  private set internalValue(value: number) {
    this.x = value;
  }
  public square (): number {
    return this.x * this.x;
  }
}
      `,
      options: [{ overrides: { constructors: false, accessors: false } }],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  private x: number;
  public constructor (x: number) {
    this.x = x;
  }
  public get internalValue() {
    return this.x;
  }
  public set internalValue(value: number) {
    this.x = value;
  }
  public square (): number {
    return this.x * this.x;
  }
  half (): number {
    return this.x / 2;
  }
}
      `,
      options: [{ overrides: { methods: false } }],
    },
  ],
  invalid: [
    {
      filename: 'test.ts',
      code: `
class Test {
  x: number
  public getX () {
    return this.x
  }
}
            `,
      errors: [
        {
          messageId: 'missingAccessibility',
          data: {
            type: 'class property',
            name: 'x',
          },
          line: 3,
          column: 3,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  private x: number
  getX () {
    return this.x
  }
}
            `,
      errors: [
        {
          messageId: 'missingAccessibility',
          data: {
            type: 'method definition',
            name: 'getX',
          },
          line: 4,
          column: 3,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  x?: number
  getX? () {
    return this.x
  }
}
            `,
      errors: [
        {
          messageId: 'missingAccessibility',
          data: {
            type: 'class property',
            name: 'x',
          },
          line: 3,
          column: 3,
        },
        {
          messageId: 'missingAccessibility',
          data: {
            type: 'method definition',
            name: 'getX',
          },
          line: 4,
          column: 3,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  protected name: string
  protected foo?: string
  public getX () {
    return this.x
  }
}
            `,
      options: [{ noPublic: true }],
      errors: [
        {
          messageId: 'unwantedPublicAccessibility',
          data: {
            type: 'method definition',
            name: 'getX',
          },
          line: 5,
          column: 3,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  protected name: string
  public foo?: string
  getX () {
    return this.x
  }
}
            `,
      options: [{ noPublic: true }],
      errors: [
        {
          messageId: 'unwantedPublicAccessibility',
          data: {
            type: 'class property',
            name: 'foo',
          },
          line: 4,
          column: 3,
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  public x: number
  public getX () {
    return this.x
  }
}
            `,
      errors: [
        {
          messageId: 'unwantedPublicAccessibility',
          line: 3,
          column: 3,
        },
        {
          messageId: 'unwantedPublicAccessibility',
          line: 4,
          column: 3,
        },
      ],
      options: [{ noPublic: true }],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  private x: number;
  constructor (x: number) {
    this.x = x;
  }
  get internalValue() {
    return this.x;
  }
  set internalValue(value: number) {
    this.x = value;
  }
}
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 7,
          column: 3,
        },
        {
          messageId: 'missingAccessibility',
          line: 10,
          column: 3,
        },
      ],
      options: [{ overrides: { constructors: { noPublic: true } } }],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  private x: number;
  constructor (x: number) {
    this.x = x;
  }
  get internalValue() {
    return this.x;
  }
  set internalValue(value: number) {
    this.x = value;
  }
}
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 4,
          column: 3,
        },
        {
          messageId: 'missingAccessibility',
          line: 7,
          column: 3,
        },
        {
          messageId: 'missingAccessibility',
          line: 10,
          column: 3,
        },
      ],
      options: [{ overrides: { constructors: { noPublic: false } } }],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  private x: number;
  constructor (x: number) {
    this.x = x;
  }
  get internalValue() {
    return this.x;
  }
  set internalValue(value: number) {
    this.x = value;
  }
}
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 4,
          column: 3,
        },
        {
          messageId: 'missingAccessibility',
          line: 7,
          column: 3,
        },
        {
          messageId: 'missingAccessibility',
          line: 10,
          column: 3,
        },
      ],
      options: [{ overrides: { constructors: true } }],
    },
  ],
});
