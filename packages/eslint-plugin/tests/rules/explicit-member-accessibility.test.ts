import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/explicit-member-accessibility';

const ruleTester = new RuleTester();

ruleTester.run('explicit-member-accessibility', rule, {
  valid: [
    {
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
      code: `
class Test {
  protected name: string;
  protected foo?: string;
  public 'foo-bar'?: string;
}
      `,
    },
    {
      code: `
class Test {
  public constructor({ x, y }: { x: number; y: number }) {}
}
      `,
    },
    {
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
      options: [{ overrides: { accessors: 'off', constructors: 'off' } }],
    },
    {
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
      code: `
class Test {
  constructor(private x: number) {}
}
      `,
      options: [{ accessibility: 'no-public' }],
    },
    {
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
      code: `
class Test {
  constructor(public foo: number) {}
}
      `,
      options: [{ accessibility: 'no-public' }],
    },
    {
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
      code: `
class Test {
  x = 2;
}
      `,
      options: [{ overrides: { properties: 'off' } }],
    },
    {
      code: `
class Test {
  private x = 2;
}
      `,
      options: [{ overrides: { properties: 'explicit' } }],
    },
    {
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
  #foo = 1;
  #bar() {}
}
      `,
      options: [{ accessibility: 'explicit' }],
    },
    {
      code: `
class Test {
  private accessor foo = 1;
}
      `,
    },
    {
      code: `
abstract class Test {
  private abstract accessor foo: number;
}
      `,
    },
  ],
  invalid: [
    {
      code: `
export class XXXX {
  public constructor(readonly value: string) {}
}
      `,
      errors: [
        {
          column: 22,
          endColumn: 36,
          endLine: 3,
          line: 3,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
export class XXXX {
  public constructor(public readonly value: string) {}
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
export class XXXX {
  public constructor(private readonly value: string) {}
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
export class XXXX {
  public constructor(protected readonly value: string) {}
}
      `,
            },
          ],
        },
      ],
      options: [
        {
          accessibility: 'off',
          overrides: {
            parameterProperties: 'explicit',
          },
        },
      ],
      output: null,
    },
    {
      code: `
export class WithParameterProperty {
  public constructor(readonly value: string) {}
}
      `,
      errors: [
        {
          column: 22,
          endColumn: 36,
          endLine: 3,
          line: 3,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
export class WithParameterProperty {
  public constructor(public readonly value: string) {}
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
export class WithParameterProperty {
  public constructor(private readonly value: string) {}
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
export class WithParameterProperty {
  public constructor(protected readonly value: string) {}
}
      `,
            },
          ],
        },
      ],
      options: [{ accessibility: 'explicit' }],
      output: null,
    },
    {
      code: `
export class XXXX {
  public constructor(readonly samosa: string) {}
}
      `,
      errors: [
        {
          column: 22,
          endColumn: 37,
          endLine: 3,
          line: 3,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
export class XXXX {
  public constructor(public readonly samosa: string) {}
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
export class XXXX {
  public constructor(private readonly samosa: string) {}
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
export class XXXX {
  public constructor(protected readonly samosa: string) {}
}
      `,
            },
          ],
        },
      ],
      options: [
        {
          accessibility: 'off',
          overrides: {
            constructors: 'explicit',
            parameterProperties: 'explicit',
          },
        },
      ],
      output: null,
    },
    {
      code: `
class Test {
  public constructor(readonly foo: string) {}
}
      `,
      errors: [
        {
          column: 22,
          endColumn: 34,
          endLine: 3,
          line: 3,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  public constructor(public readonly foo: string) {}
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  public constructor(private readonly foo: string) {}
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  public constructor(protected readonly foo: string) {}
}
      `,
            },
          ],
        },
      ],
      options: [
        {
          accessibility: 'explicit',
          overrides: { parameterProperties: 'explicit' },
        },
      ],
      output: null,
    },
    {
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
          column: 3,
          data: {
            name: 'x',
            type: 'class property',
          },
          endColumn: 4,
          endLine: 3,
          line: 3,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',

              output: `
class Test {
  public x: number;
  public getX() {
    return this.x;
  }
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',

              output: `
class Test {
  private x: number;
  public getX() {
    return this.x;
  }
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',

              output: `
class Test {
  protected x: number;
  public getX() {
    return this.x;
  }
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
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
          column: 3,
          data: {
            name: 'getX',
            type: 'method definition',
          },
          endColumn: 7,
          endLine: 4,
          line: 4,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  private x: number;
  public getX() {
    return this.x;
  }
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  private x: number;
  private getX() {
    return this.x;
  }
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  private x: number;
  protected getX() {
    return this.x;
  }
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
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
          column: 3,
          data: {
            name: 'x',
            type: 'class property',
          },
          endColumn: 4,
          endLine: 3,
          line: 3,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  public x?: number;
  getX?() {
    return this.x;
  }
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  private x?: number;
  getX?() {
    return this.x;
  }
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  protected x?: number;
  getX?() {
    return this.x;
  }
}
      `,
            },
          ],
        },
        {
          column: 3,
          data: {
            name: 'getX',
            type: 'method definition',
          },
          endColumn: 7,
          endLine: 4,
          line: 4,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  x?: number;
  public getX?() {
    return this.x;
  }
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  x?: number;
  private getX?() {
    return this.x;
  }
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  x?: number;
  protected getX?() {
    return this.x;
  }
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
class Test {
  protected name: string;
  protected foo?: string;
  public getX() {
    return this.x;
  }
}
      `,
      errors: [
        {
          column: 3,
          data: {
            name: 'getX',
            type: 'method definition',
          },
          endColumn: 9,
          endLine: 5,
          line: 5,
          messageId: 'unwantedPublicAccessibility',
        },
      ],
      options: [{ accessibility: 'no-public' }],
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
      code: `
class Test {
  protected name: string;
  public foo?: string;
  getX() {
    return this.x;
  }
}
      `,
      errors: [
        {
          column: 3,
          data: {
            name: 'foo',
            type: 'class property',
          },
          endColumn: 9,
          endLine: 4,
          line: 4,
          messageId: 'unwantedPublicAccessibility',
        },
      ],
      options: [{ accessibility: 'no-public' }],
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
          column: 3,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'unwantedPublicAccessibility',
        },
        {
          column: 3,
          endColumn: 9,
          endLine: 4,
          line: 4,
          messageId: 'unwantedPublicAccessibility',
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
          column: 3,
          endColumn: 20,
          endLine: 7,
          line: 7,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  private x: number;
  constructor(x: number) {
    this.x = x;
  }
  public get internalValue() {
    return this.x;
  }
  set internalValue(value: number) {
    this.x = value;
  }
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  private x: number;
  constructor(x: number) {
    this.x = x;
  }
  private get internalValue() {
    return this.x;
  }
  set internalValue(value: number) {
    this.x = value;
  }
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  private x: number;
  constructor(x: number) {
    this.x = x;
  }
  protected get internalValue() {
    return this.x;
  }
  set internalValue(value: number) {
    this.x = value;
  }
}
      `,
            },
          ],
        },
        {
          column: 3,
          endColumn: 20,
          endLine: 10,
          line: 10,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  private x: number;
  constructor(x: number) {
    this.x = x;
  }
  get internalValue() {
    return this.x;
  }
  public set internalValue(value: number) {
    this.x = value;
  }
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
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
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  private x: number;
  constructor(x: number) {
    this.x = x;
  }
  get internalValue() {
    return this.x;
  }
  protected set internalValue(value: number) {
    this.x = value;
  }
}
      `,
            },
          ],
        },
      ],
      options: [{ overrides: { constructors: 'no-public' } }],
      output: null,
    },
    {
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
          column: 3,
          endColumn: 14,
          endLine: 4,
          line: 4,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  private x: number;
  public constructor(x: number) {
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
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  private x: number;
  private constructor(x: number) {
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
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  private x: number;
  protected constructor(x: number) {
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
          ],
        },
        {
          column: 3,
          endColumn: 20,
          endLine: 7,
          line: 7,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  private x: number;
  constructor(x: number) {
    this.x = x;
  }
  public get internalValue() {
    return this.x;
  }
  set internalValue(value: number) {
    this.x = value;
  }
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  private x: number;
  constructor(x: number) {
    this.x = x;
  }
  private get internalValue() {
    return this.x;
  }
  set internalValue(value: number) {
    this.x = value;
  }
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  private x: number;
  constructor(x: number) {
    this.x = x;
  }
  protected get internalValue() {
    return this.x;
  }
  set internalValue(value: number) {
    this.x = value;
  }
}
      `,
            },
          ],
        },
        {
          column: 3,
          endColumn: 20,
          endLine: 10,
          line: 10,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  private x: number;
  constructor(x: number) {
    this.x = x;
  }
  get internalValue() {
    return this.x;
  }
  public set internalValue(value: number) {
    this.x = value;
  }
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
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
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  private x: number;
  constructor(x: number) {
    this.x = x;
  }
  get internalValue() {
    return this.x;
  }
  protected set internalValue(value: number) {
    this.x = value;
  }
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
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
          column: 3,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  public constructor(public x: number) {}
  public foo(): string {
    return 'foo';
  }
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  private constructor(public x: number) {}
  public foo(): string {
    return 'foo';
  }
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  protected constructor(public x: number) {}
  public foo(): string {
    return 'foo';
  }
}
      `,
            },
          ],
        },
      ],
      options: [
        {
          overrides: { parameterProperties: 'no-public' },
        },
      ],
      output: null,
    },
    {
      code: `
class Test {
  constructor(public x: number) {}
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  public constructor(public x: number) {}
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  private constructor(public x: number) {}
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  protected constructor(public x: number) {}
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
class Test {
  constructor(public readonly x: number) {}
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'unwantedPublicAccessibility',
        },
      ],
      options: [
        {
          accessibility: 'off',
          overrides: { parameterProperties: 'no-public' },
        },
      ],
      output: `
class Test {
  constructor(readonly x: number) {}
}
      `,
    },
    {
      code: `
class Test {
  x = 2;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 4,
          endLine: 3,
          line: 3,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  public x = 2;
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  private x = 2;
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  protected x = 2;
}
      `,
            },
          ],
        },
      ],
      options: [
        {
          accessibility: 'off',
          overrides: { properties: 'explicit' },
        },
      ],
      output: null,
    },
    {
      code: `
class Test {
  public x = 2;
  private x = 2;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'unwantedPublicAccessibility',
        },
      ],
      options: [
        {
          accessibility: 'off',
          overrides: { properties: 'no-public' },
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
  constructor(public x: any[]) {}
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  public constructor(public x: any[]) {}
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  private constructor(public x: any[]) {}
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
class Test {
  protected constructor(public x: any[]) {}
}
      `,
            },
          ],
        },
      ],
      options: [{ accessibility: 'explicit' }],
      output: null,
    },
    {
      code: noFormat`
class Test {
  public /*public*/constructor(private foo: string) {}
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'unwantedPublicAccessibility',
        },
      ],
      options: [
        {
          accessibility: 'no-public',
        },
      ],
      output: `
class Test {
  /*public*/constructor(private foo: string) {}
}
      `,
    },
    {
      code: `
class Test {
  @public
  public foo() {}
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 9,
          endLine: 4,
          line: 4,
          messageId: 'unwantedPublicAccessibility',
        },
      ],
      options: [
        {
          accessibility: 'no-public',
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
      code: `
class Test {
  @public
  public foo;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 9,
          endLine: 4,
          line: 4,
          messageId: 'unwantedPublicAccessibility',
        },
      ],
      options: [
        {
          accessibility: 'no-public',
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
      code: `
class Test {
  public foo = '';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'unwantedPublicAccessibility',
        },
      ],
      options: [
        {
          accessibility: 'no-public',
        },
      ],
      output: `
class Test {
  foo = '';
}
      `,
    },
    {
      code: noFormat`
class Test {
  constructor(public/* Hi there */ readonly foo) {}
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'unwantedPublicAccessibility',
        },
      ],
      options: [
        {
          accessibility: 'no-public',
          overrides: { parameterProperties: 'no-public' },
        },
      ],
      output: `
class Test {
  constructor(/* Hi there */ readonly foo) {}
}
      `,
    },
    {
      code: `
class Test {
  constructor(public readonly foo: string) {}
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'unwantedPublicAccessibility',
        },
      ],
      options: [
        {
          accessibility: 'no-public',
        },
      ],
      output: `
class Test {
  constructor(readonly foo: string) {}
}
      `,
    },
    {
      code: `
class EnsureWhiteSPaceSpan {
  public constructor() {}
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'unwantedPublicAccessibility',
        },
      ],
      options: [
        {
          accessibility: 'no-public',
          overrides: { parameterProperties: 'no-public' },
        },
      ],
      output: `
class EnsureWhiteSPaceSpan {
  constructor() {}
}
      `,
    },
    {
      code: `
class EnsureWhiteSPaceSpan {
  public /* */ constructor() {}
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'unwantedPublicAccessibility',
        },
      ],
      options: [
        {
          accessibility: 'no-public',
          overrides: { parameterProperties: 'no-public' },
        },
      ],
      output: `
class EnsureWhiteSPaceSpan {
  /* */ constructor() {}
}
      `,
    },
    // quoted names
    {
      code: noFormat`
class Test {
  public 'foo' = 1;
  public 'foo foo' = 2;
  public 'bar'() {}
  public 'bar bar'() {}
}
      `,
      errors: [
        {
          column: 3,
          data: {
            name: 'foo',
            type: 'class property',
          },
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'unwantedPublicAccessibility',
        },
        {
          column: 3,
          data: {
            name: '"foo foo"',
            type: 'class property',
          },
          endColumn: 9,
          endLine: 4,
          line: 4,
          messageId: 'unwantedPublicAccessibility',
        },
        {
          column: 3,
          data: {
            name: 'bar',
            type: 'method definition',
          },
          endColumn: 9,
          endLine: 5,
          line: 5,
          messageId: 'unwantedPublicAccessibility',
        },
        {
          column: 3,
          data: {
            name: '"bar bar"',
            type: 'method definition',
          },
          endColumn: 9,
          endLine: 6,
          line: 6,
          messageId: 'unwantedPublicAccessibility',
        },
      ],
      options: [{ accessibility: 'no-public' }],
      output: `
class Test {
  'foo' = 1;
  'foo foo' = 2;
  'bar'() {}
  'bar bar'() {}
}
      `,
    },
    {
      code: `
abstract class SomeClass {
  abstract method(): string;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
abstract class SomeClass {
  public abstract method(): string;
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
abstract class SomeClass {
  private abstract method(): string;
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
abstract class SomeClass {
  protected abstract method(): string;
}
      `,
            },
          ],
        },
      ],
      options: [{ accessibility: 'explicit' }],
      output: null,
    },
    {
      code: `
abstract class SomeClass {
  public abstract method(): string;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'unwantedPublicAccessibility',
        },
      ],
      options: [
        {
          accessibility: 'no-public',
          overrides: { parameterProperties: 'no-public' },
        },
      ],
      output: `
abstract class SomeClass {
  abstract method(): string;
}
      `,
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/3835
      code: `
abstract class SomeClass {
  abstract x: string;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 13,
          endLine: 3,
          line: 3,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
abstract class SomeClass {
  public abstract x: string;
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
abstract class SomeClass {
  private abstract x: string;
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
abstract class SomeClass {
  protected abstract x: string;
}
      `,
            },
          ],
        },
      ],
      options: [{ accessibility: 'explicit' }],
      output: null,
    },
    {
      code: `
abstract class SomeClass {
  public abstract x: string;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'unwantedPublicAccessibility',
        },
      ],
      options: [
        {
          accessibility: 'no-public',
          overrides: { parameterProperties: 'no-public' },
        },
      ],
      output: `
abstract class SomeClass {
  abstract x: string;
}
      `,
    },
    {
      code: `
class SomeClass {
  accessor foo = 1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
class SomeClass {
  public accessor foo = 1;
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
class SomeClass {
  private accessor foo = 1;
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
class SomeClass {
  protected accessor foo = 1;
}
      `,
            },
          ],
        },
      ],
      options: [{ accessibility: 'explicit' }],
    },
    {
      code: `
abstract class SomeClass {
  abstract accessor foo: string;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
abstract class SomeClass {
  public abstract accessor foo: string;
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
abstract class SomeClass {
  private abstract accessor foo: string;
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
abstract class SomeClass {
  protected abstract accessor foo: string;
}
      `,
            },
          ],
        },
      ],
      options: [{ accessibility: 'explicit' }],
    },
    {
      code: `
class DecoratedClass {
  constructor(@foo @bar() readonly arg: string) {}
  @foo @bar() x: string;
  @foo @bar() getX() {
    return this.x;
  }
  @foo
  @bar()
  get y() {
    return this.x;
  }
  @foo @bar() set z(@foo @bar() value: x) {
    this.x = x;
  }
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
class DecoratedClass {
  public constructor(@foo @bar() readonly arg: string) {}
  @foo @bar() x: string;
  @foo @bar() getX() {
    return this.x;
  }
  @foo
  @bar()
  get y() {
    return this.x;
  }
  @foo @bar() set z(@foo @bar() value: x) {
    this.x = x;
  }
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
class DecoratedClass {
  private constructor(@foo @bar() readonly arg: string) {}
  @foo @bar() x: string;
  @foo @bar() getX() {
    return this.x;
  }
  @foo
  @bar()
  get y() {
    return this.x;
  }
  @foo @bar() set z(@foo @bar() value: x) {
    this.x = x;
  }
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
class DecoratedClass {
  protected constructor(@foo @bar() readonly arg: string) {}
  @foo @bar() x: string;
  @foo @bar() getX() {
    return this.x;
  }
  @foo
  @bar()
  get y() {
    return this.x;
  }
  @foo @bar() set z(@foo @bar() value: x) {
    this.x = x;
  }
}
      `,
            },
          ],
        },
        {
          column: 27,
          endColumn: 39,
          endLine: 3,
          line: 3,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
class DecoratedClass {
  constructor(@foo @bar() public readonly arg: string) {}
  @foo @bar() x: string;
  @foo @bar() getX() {
    return this.x;
  }
  @foo
  @bar()
  get y() {
    return this.x;
  }
  @foo @bar() set z(@foo @bar() value: x) {
    this.x = x;
  }
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
class DecoratedClass {
  constructor(@foo @bar() private readonly arg: string) {}
  @foo @bar() x: string;
  @foo @bar() getX() {
    return this.x;
  }
  @foo
  @bar()
  get y() {
    return this.x;
  }
  @foo @bar() set z(@foo @bar() value: x) {
    this.x = x;
  }
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
class DecoratedClass {
  constructor(@foo @bar() protected readonly arg: string) {}
  @foo @bar() x: string;
  @foo @bar() getX() {
    return this.x;
  }
  @foo
  @bar()
  get y() {
    return this.x;
  }
  @foo @bar() set z(@foo @bar() value: x) {
    this.x = x;
  }
}
      `,
            },
          ],
        },
        {
          column: 15,
          endColumn: 16,
          endLine: 4,
          line: 4,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
class DecoratedClass {
  constructor(@foo @bar() readonly arg: string) {}
  @foo @bar() public x: string;
  @foo @bar() getX() {
    return this.x;
  }
  @foo
  @bar()
  get y() {
    return this.x;
  }
  @foo @bar() set z(@foo @bar() value: x) {
    this.x = x;
  }
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
class DecoratedClass {
  constructor(@foo @bar() readonly arg: string) {}
  @foo @bar() private x: string;
  @foo @bar() getX() {
    return this.x;
  }
  @foo
  @bar()
  get y() {
    return this.x;
  }
  @foo @bar() set z(@foo @bar() value: x) {
    this.x = x;
  }
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
class DecoratedClass {
  constructor(@foo @bar() readonly arg: string) {}
  @foo @bar() protected x: string;
  @foo @bar() getX() {
    return this.x;
  }
  @foo
  @bar()
  get y() {
    return this.x;
  }
  @foo @bar() set z(@foo @bar() value: x) {
    this.x = x;
  }
}
      `,
            },
          ],
        },
        {
          column: 15,
          endColumn: 19,
          endLine: 5,
          line: 5,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
class DecoratedClass {
  constructor(@foo @bar() readonly arg: string) {}
  @foo @bar() x: string;
  @foo @bar() public getX() {
    return this.x;
  }
  @foo
  @bar()
  get y() {
    return this.x;
  }
  @foo @bar() set z(@foo @bar() value: x) {
    this.x = x;
  }
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
class DecoratedClass {
  constructor(@foo @bar() readonly arg: string) {}
  @foo @bar() x: string;
  @foo @bar() private getX() {
    return this.x;
  }
  @foo
  @bar()
  get y() {
    return this.x;
  }
  @foo @bar() set z(@foo @bar() value: x) {
    this.x = x;
  }
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
class DecoratedClass {
  constructor(@foo @bar() readonly arg: string) {}
  @foo @bar() x: string;
  @foo @bar() protected getX() {
    return this.x;
  }
  @foo
  @bar()
  get y() {
    return this.x;
  }
  @foo @bar() set z(@foo @bar() value: x) {
    this.x = x;
  }
}
      `,
            },
          ],
        },
        {
          column: 3,
          endColumn: 8,
          endLine: 10,
          line: 10,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
class DecoratedClass {
  constructor(@foo @bar() readonly arg: string) {}
  @foo @bar() x: string;
  @foo @bar() getX() {
    return this.x;
  }
  @foo
  @bar()
  public get y() {
    return this.x;
  }
  @foo @bar() set z(@foo @bar() value: x) {
    this.x = x;
  }
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
class DecoratedClass {
  constructor(@foo @bar() readonly arg: string) {}
  @foo @bar() x: string;
  @foo @bar() getX() {
    return this.x;
  }
  @foo
  @bar()
  private get y() {
    return this.x;
  }
  @foo @bar() set z(@foo @bar() value: x) {
    this.x = x;
  }
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
class DecoratedClass {
  constructor(@foo @bar() readonly arg: string) {}
  @foo @bar() x: string;
  @foo @bar() getX() {
    return this.x;
  }
  @foo
  @bar()
  protected get y() {
    return this.x;
  }
  @foo @bar() set z(@foo @bar() value: x) {
    this.x = x;
  }
}
      `,
            },
          ],
        },
        {
          column: 15,
          endColumn: 20,
          endLine: 13,
          line: 13,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
class DecoratedClass {
  constructor(@foo @bar() readonly arg: string) {}
  @foo @bar() x: string;
  @foo @bar() getX() {
    return this.x;
  }
  @foo
  @bar()
  get y() {
    return this.x;
  }
  @foo @bar() public set z(@foo @bar() value: x) {
    this.x = x;
  }
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
class DecoratedClass {
  constructor(@foo @bar() readonly arg: string) {}
  @foo @bar() x: string;
  @foo @bar() getX() {
    return this.x;
  }
  @foo
  @bar()
  get y() {
    return this.x;
  }
  @foo @bar() private set z(@foo @bar() value: x) {
    this.x = x;
  }
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
class DecoratedClass {
  constructor(@foo @bar() readonly arg: string) {}
  @foo @bar() x: string;
  @foo @bar() getX() {
    return this.x;
  }
  @foo
  @bar()
  get y() {
    return this.x;
  }
  @foo @bar() protected set z(@foo @bar() value: x) {
    this.x = x;
  }
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
abstract class SomeClass {
  abstract ['computed-method-name'](): string;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 36,
          endLine: 3,
          line: 3,
          messageId: 'missingAccessibility',
          suggestions: [
            {
              data: { type: 'public' },
              messageId: 'addExplicitAccessibility',
              output: `
abstract class SomeClass {
  public abstract ['computed-method-name'](): string;
}
      `,
            },
            {
              data: { type: 'private' },
              messageId: 'addExplicitAccessibility',
              output: `
abstract class SomeClass {
  private abstract ['computed-method-name'](): string;
}
      `,
            },
            {
              data: { type: 'protected' },
              messageId: 'addExplicitAccessibility',
              output: `
abstract class SomeClass {
  protected abstract ['computed-method-name'](): string;
}
      `,
            },
          ],
        },
      ],
      options: [{ accessibility: 'explicit' }],
      output: null,
    },
  ],
});
