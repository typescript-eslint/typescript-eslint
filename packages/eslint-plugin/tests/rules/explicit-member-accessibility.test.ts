import rule from '../../src/rules/explicit-member-accessibility';
import { RuleTester, noFormat } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('explicit-member-accessibility', rule, {
  valid: [
    {
      filename: 'test.ts',
      code: `
class Test {
  public constructor(private foo: string) {}
}
      `,
      options: [
        {
          accessibility: 'explicit',
          overrides: { parameterProperties: 'explicit' },
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  public constructor(private readonly foo: string) {}
}
      `,
      options: [
        {
          accessibility: 'explicit',
          overrides: { parameterProperties: 'explicit' },
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  public constructor(private foo: string) {}
}
      `,
      options: [
        {
          accessibility: 'explicit',
          overrides: { parameterProperties: 'off' },
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  public constructor(protected foo: string) {}
}
      `,
      options: [
        {
          accessibility: 'explicit',
          overrides: { parameterProperties: 'off' },
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  public constructor(public foo: string) {}
}
      `,
      options: [
        {
          accessibility: 'explicit',
          overrides: { parameterProperties: 'off' },
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  public constructor(readonly foo: string) {}
}
      `,
      options: [
        {
          accessibility: 'explicit',
          overrides: { parameterProperties: 'off' },
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  public constructor(private readonly foo: string) {}
}
      `,
      options: [
        {
          accessibility: 'explicit',
          overrides: { parameterProperties: 'off' },
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  protected name: string;
  private x: number;
  public getX() {
    return this.x;
  }
}
      `,
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  protected name: string;
  protected foo?: string;
  public 'foo-bar'?: string;
}
      `,
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  public constructor({ x, y }: { x: number; y: number }) {}
}
      `,
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  protected name: string;
  protected foo?: string;
  public getX() {
    return this.x;
  }
}
      `,
      options: [{ accessibility: 'explicit' }],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  protected name: string;
  protected foo?: string;
  getX() {
    return this.x;
  }
}
      `,
      options: [{ accessibility: 'no-public' }],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  name: string;
  foo?: string;
  getX() {
    return this.x;
  }
  get fooName(): string {
    return this.foo + ' ' + this.name;
  }
}
      `,
      options: [{ accessibility: 'no-public' }],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  private x: number;
  constructor(x: number) {
    this.x = x;
  }
  get internalValue() {
    return this.x;
  }
  private set internalValue(value: number) {
    this.x = value;
  }
  public square(): number {
    return this.x * this.x;
  }
}
      `,
      options: [{ overrides: { constructors: 'off', accessors: 'off' } }],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  private x: number;
  public constructor(x: number) {
    this.x = x;
  }
  public get internalValue() {
    return this.x;
  }
  public set internalValue(value: number) {
    this.x = value;
  }
  public square(): number {
    return this.x * this.x;
  }
  half(): number {
    return this.x / 2;
  }
}
      `,
      options: [{ overrides: { methods: 'off' } }],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  constructor(private x: number) {}
}
      `,
      options: [{ accessibility: 'no-public' }],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  constructor(public x: number) {}
}
      `,
      options: [
        {
          accessibility: 'no-public',
          overrides: { parameterProperties: 'off' },
        },
      ],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  constructor(public foo: number) {}
}
      `,
      options: [{ accessibility: 'no-public' }],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  public getX() {
    return this.x;
  }
}
      `,
      options: [{ ignoredMethodNames: ['getX'] }],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  public static getX() {
    return this.x;
  }
}
      `,
      options: [{ ignoredMethodNames: ['getX'] }],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  get getX() {
    return this.x;
  }
}
      `,
      options: [{ ignoredMethodNames: ['getX'] }],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  getX() {
    return this.x;
  }
}
      `,
      options: [{ ignoredMethodNames: ['getX'] }],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  x = 2;
}
      `,
      options: [{ overrides: { properties: 'off' } }],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  private x = 2;
}
      `,
      options: [{ overrides: { properties: 'explicit' } }],
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  x = 2;
  private x = 2;
}
      `,
      options: [{ overrides: { properties: 'no-public' } }],
    },
    {
      code: `
class Test {
  constructor(private { x }: any[]) {}
}
      `,
      options: [{ accessibility: 'no-public' }],
    },
  ],
  invalid: [
    {
      filename: 'test.ts',
      code: `
export class XXXX {
  public constructor(readonly value: string) {}
}
      `,
      options: [
        {
          accessibility: 'off',
          overrides: {
            parameterProperties: 'explicit',
          },
        },
      ],
      errors: [
        {
          messageId: 'missingAccessibility',
          column: 22,
          line: 3,
        },
      ],
      output: `
export class XXXX {
  public constructor(readonly value: string) {}
}
      `,
    },
    {
      filename: 'test.ts',
      code: `
export class WithParameterProperty {
  public constructor(readonly value: string) {}
}
      `,
      options: [{ accessibility: 'explicit' }],
      errors: [{ messageId: 'missingAccessibility' }],
      output: `
export class WithParameterProperty {
  public constructor(readonly value: string) {}
}
      `,
    },
    {
      filename: 'test.ts',
      code: `
export class XXXX {
  public constructor(readonly samosa: string) {}
}
      `,
      options: [
        {
          accessibility: 'off',
          overrides: {
            constructors: 'explicit',
            parameterProperties: 'explicit',
          },
        },
      ],
      errors: [{ messageId: 'missingAccessibility' }],
      output: `
export class XXXX {
  public constructor(readonly samosa: string) {}
}
      `,
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  public constructor(readonly foo: string) {}
}
      `,
      options: [
        {
          accessibility: 'explicit',
          overrides: { parameterProperties: 'explicit' },
        },
      ],
      errors: [{ messageId: 'missingAccessibility' }],
      output: `
class Test {
  public constructor(readonly foo: string) {}
}
      `,
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  x: number;
  public getX() {
    return this.x;
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
      output: `
class Test {
  x: number;
  public getX() {
    return this.x;
  }
}
      `,
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  private x: number;
  getX() {
    return this.x;
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
      output: `
class Test {
  private x: number;
  getX() {
    return this.x;
  }
}
      `,
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  x?: number;
  getX?() {
    return this.x;
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
      output: `
class Test {
  x?: number;
  getX?() {
    return this.x;
  }
}
      `,
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  protected name: string;
  protected foo?: string;
  public getX() {
    return this.x;
  }
}
      `,
      options: [{ accessibility: 'no-public' }],
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
      output: `
class Test {
  protected name: string;
  protected foo?: string;
  getX() {
    return this.x;
  }
}
      `,
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  protected name: string;
  public foo?: string;
  getX() {
    return this.x;
  }
}
      `,
      options: [{ accessibility: 'no-public' }],
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
      output: `
class Test {
  protected name: string;
  foo?: string;
  getX() {
    return this.x;
  }
}
      `,
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  public x: number;
  public getX() {
    return this.x;
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
      options: [{ accessibility: 'no-public' }],
      output: `
class Test {
  x: number;
  getX() {
    return this.x;
  }
}
      `,
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  private x: number;
  constructor(x: number) {
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
      options: [{ overrides: { constructors: 'no-public' } }],
      output: `
class Test {
  private x: number;
  constructor(x: number) {
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
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  private x: number;
  constructor(x: number) {
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
      output: `
class Test {
  private x: number;
  constructor(x: number) {
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
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  constructor(public x: number) {}
  public foo(): string {
    return 'foo';
  }
}
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 3,
        },
      ],
      options: [
        {
          overrides: { parameterProperties: 'no-public' },
        },
      ],
      output: `
class Test {
  constructor(public x: number) {}
  public foo(): string {
    return 'foo';
  }
}
      `,
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  constructor(public x: number) {}
}
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 3,
        },
      ],
      output: `
class Test {
  constructor(public x: number) {}
}
      `,
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  constructor(public readonly x: number) {}
}
      `,
      options: [
        {
          accessibility: 'off',
          overrides: { parameterProperties: 'no-public' },
        },
      ],
      errors: [
        {
          messageId: 'unwantedPublicAccessibility',
          line: 3,
          column: 15,
        },
      ],
      output: `
class Test {
  constructor(readonly x: number) {}
}
      `,
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  x = 2;
}
      `,
      options: [
        {
          accessibility: 'off',
          overrides: { properties: 'explicit' },
        },
      ],
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 3,
        },
      ],
      output: `
class Test {
  x = 2;
}
      `,
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  public x = 2;
  private x = 2;
}
      `,
      options: [
        {
          accessibility: 'off',
          overrides: { properties: 'no-public' },
        },
      ],
      errors: [
        {
          messageId: 'unwantedPublicAccessibility',
          line: 3,
          column: 3,
        },
      ],
      output: `
class Test {
  x = 2;
  private x = 2;
}
      `,
    },
    {
      code: `
class Test {
  constructor(public ...x: any[]) {}
}
      `,
      options: [{ accessibility: 'explicit' }],
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 3,
        },
      ],
      output: `
class Test {
  constructor(public ...x: any[]) {}
}
      `,
    },
    {
      filename: 'test.ts',
      code: noFormat`
class Test {
  @public
  public /*public*/constructor(private foo: string) {}
}
      `,
      options: [
        {
          accessibility: 'no-public',
        },
      ],
      errors: [
        {
          messageId: 'unwantedPublicAccessibility',
          line: 3,
          column: 3,
        },
      ],
      output: noFormat`
class Test {
  @public
  /*public*/constructor(private foo: string) {}
}
      `,
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  @public
  public foo() {}
}
      `,
      options: [
        {
          accessibility: 'no-public',
        },
      ],
      errors: [
        {
          messageId: 'unwantedPublicAccessibility',
          line: 3,
          column: 3,
        },
      ],
      output: `
class Test {
  @public
  foo() {}
}
      `,
    },

    {
      filename: 'test.ts',
      code: `
class Test {
  @public
  public foo;
}
      `,
      options: [
        {
          accessibility: 'no-public',
        },
      ],
      errors: [
        {
          messageId: 'unwantedPublicAccessibility',
          line: 3,
          column: 3,
        },
      ],
      output: `
class Test {
  @public
  foo;
}
      `,
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  public foo = '';
}
      `,
      options: [
        {
          accessibility: 'no-public',
        },
      ],
      errors: [
        {
          messageId: 'unwantedPublicAccessibility',
          line: 3,
          column: 3,
        },
      ],
      output: `
class Test {
  foo = '';
}
      `,
    },

    {
      filename: 'test.ts',
      code: noFormat`
class Test {
  contructor(public/* Hi there */ readonly foo);
}
      `,
      options: [
        {
          accessibility: 'no-public',
          overrides: { parameterProperties: 'no-public' },
        },
      ],
      errors: [
        {
          messageId: 'unwantedPublicAccessibility',
          line: 3,
          column: 14,
        },
      ],
      output: `
class Test {
  contructor(/* Hi there */ readonly foo);
}
      `,
    },
    {
      filename: 'test.ts',
      code: `
class Test {
  contructor(public readonly foo: string);
}
      `,
      options: [
        {
          accessibility: 'no-public',
        },
      ],
      errors: [
        {
          messageId: 'unwantedPublicAccessibility',
          line: 3,
          column: 14,
        },
      ],
      output: `
class Test {
  contructor(readonly foo: string);
}
      `,
    },
    {
      filename: 'test.ts',
      code: `
class EnsureWhiteSPaceSpan {
  public constructor() {}
}
      `,
      options: [
        {
          accessibility: 'no-public',
          overrides: { parameterProperties: 'no-public' },
        },
      ],
      errors: [
        {
          messageId: 'unwantedPublicAccessibility',
          line: 3,
          column: 3,
        },
      ],
      output: `
class EnsureWhiteSPaceSpan {
  constructor() {}
}
      `,
    },
    {
      filename: 'test.ts',
      code: `
class EnsureWhiteSPaceSpan {
  public /* */ constructor() {}
}
      `,
      options: [
        {
          accessibility: 'no-public',
          overrides: { parameterProperties: 'no-public' },
        },
      ],
      errors: [
        {
          messageId: 'unwantedPublicAccessibility',
          line: 3,
          column: 3,
        },
      ],
      output: `
class EnsureWhiteSPaceSpan {
  /* */ constructor() {}
}
      `,
    },
  ],
});
