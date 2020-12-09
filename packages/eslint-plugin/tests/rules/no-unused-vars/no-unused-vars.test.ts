import rule from '../../../src/rules/no-unused-vars';
import { collectUnusedVariables } from '../../../src/util';
import { noFormat, RuleTester } from '../../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {},
  },
  parser: '@typescript-eslint/parser',
});

// this is used to ensure that the caching the utility does does not impact the results done by no-unused-vars
ruleTester.defineRule('collect-unused-vars', context => {
  collectUnusedVariables(context);
  return {};
});

ruleTester.run('no-unused-vars', rule, {
  valid: [
    `
import { ClassDecoratorFactory } from 'decorators';
@ClassDecoratorFactory()
export class Foo {}
    `,
    `
import { ClassDecorator } from 'decorators';
@ClassDecorator
export class Foo {}
    `,
    `
import { AccessorDecoratorFactory } from 'decorators';
export class Foo {
  @AccessorDecoratorFactory(true)
  get bar() {}
}
    `,
    `
import { AccessorDecorator } from 'decorators';
export class Foo {
  @AccessorDecorator
  set bar() {}
}
    `,
    `
import { MethodDecoratorFactory } from 'decorators';
export class Foo {
  @MethodDecoratorFactory(false)
  bar() {}
}
    `,
    `
import { MethodDecorator } from 'decorators';
export class Foo {
  @MethodDecorator
  static bar() {}
}
    `,
    `
import { ConstructorParameterDecoratorFactory } from 'decorators';
export class Service {
  constructor(
    @ConstructorParameterDecoratorFactory(APP_CONFIG) config: AppConfig,
  ) {
    this.title = config.title;
  }
}
    `,
    `
import { ConstructorParameterDecorator } from 'decorators';
export class Foo {
  constructor(@ConstructorParameterDecorator bar) {
    this.bar = bar;
  }
}
    `,
    `
import { ParameterDecoratorFactory } from 'decorators';
export class Qux {
  bar(@ParameterDecoratorFactory(true) baz: number) {
    console.log(baz);
  }
}
    `,
    `
import { ParameterDecorator } from 'decorators';
export class Foo {
  static greet(@ParameterDecorator name: string) {
    return name;
  }
}
    `,
    `
import { Input, Output, EventEmitter } from 'decorators';
export class SomeComponent {
  @Input() data;
  @Output()
  click = new EventEmitter();
}
    `,
    `
import { configurable } from 'decorators';
export class A {
  @configurable(true) static prop1;

  @configurable(false)
  static prop2;
}
    `,
    `
import { foo, bar } from 'decorators';
export class B {
  @foo x;

  @bar
  y;
}
    `,
    `
interface Base {}
class Thing implements Base {}
new Thing();
    `,
    `
interface Base {}
const a: Base = {};
console.log(a);
    `,
    `
import { Foo } from 'foo';
function bar<T>(): T {}
bar<Foo>();
    `,
    `
import { Foo } from 'foo';
const bar = function <T>(): T {};
bar<Foo>();
    `,
    `
import { Foo } from 'foo';
const bar = <T>(): T => {};
bar<Foo>();
    `,
    `
import { Foo } from 'foo';
<Foo>(<T>(): T => {})();
    `,
    `
import { Nullable } from 'nullable';
const a: Nullable<string> = 'hello';
console.log(a);
    `,
    `
import { Nullable } from 'nullable';
import { SomeOther } from 'other';
const a: Nullable<SomeOther> = 'hello';
console.log(a);
    `,
    `
import { Nullable } from 'nullable';
const a: Nullable | undefined = 'hello';
console.log(a);
    `,
    `
import { Nullable } from 'nullable';
const a: Nullable & undefined = 'hello';
console.log(a);
    `,
    `
import { Nullable } from 'nullable';
import { SomeOther } from 'other';
const a: Nullable<SomeOther[]> = 'hello';
console.log(a);
    `,
    `
import { Nullable } from 'nullable';
import { SomeOther } from 'other';
const a: Nullable<Array<SomeOther>> = 'hello';
console.log(a);
    `,
    `
import { Nullable } from 'nullable';
const a: Array<Nullable> = 'hello';
console.log(a);
    `,
    `
import { Nullable } from 'nullable';
const a: Nullable[] = 'hello';
console.log(a);
    `,
    `
import { Nullable } from 'nullable';
const a: Array<Nullable[]> = 'hello';
console.log(a);
    `,
    `
import { Nullable } from 'nullable';
const a: Array<Array<Nullable>> = 'hello';
console.log(a);
    `,
    `
import { Nullable } from 'nullable';
import { SomeOther } from 'other';
const a: Array<Nullable<SomeOther>> = 'hello';
console.log(a);
    `,
    `
import { Nullable } from 'nullable';
import { Component } from 'react';
class Foo implements Component<Nullable> {}

new Foo();
    `,
    `
import { Nullable } from 'nullable';
import { Component } from 'react';
class Foo extends Component<Nullable, {}> {}
new Foo();
    `,
    `
import { Nullable } from 'nullable';
import { SomeOther } from 'some';
import { Component } from 'react';
class Foo extends Component<Nullable<SomeOther>, {}> {}
new Foo();
    `,
    `
import { Nullable } from 'nullable';
import { SomeOther } from 'some';
import { Component } from 'react';
class Foo implements Component<Nullable<SomeOther>, {}> {}
new Foo();
    `,
    `
import { Nullable } from 'nullable';
import { SomeOther } from 'some';
import { Component, Component2 } from 'react';
class Foo implements Component<Nullable<SomeOther>, {}>, Component2 {}
new Foo();
    `,
    `
import { Nullable } from 'nullable';
import { Another } from 'some';
class A {
  do = (a: Nullable<Another>) => {
    console.log(a);
  };
}
new A();
    `,
    `
import { Nullable } from 'nullable';
import { Another } from 'some';
class A {
  do(a: Nullable<Another>) {
    console.log(a);
  }
}
new A();
    `,
    `
import { Nullable } from 'nullable';
import { Another } from 'some';
class A {
  do(): Nullable<Another> {
    return null;
  }
}
new A();
    `,
    `
import { Nullable } from 'nullable';
import { Another } from 'some';
export interface A {
  do(a: Nullable<Another>);
}
    `,
    `
import { Nullable } from 'nullable';
import { Another } from 'some';
export interface A {
  other: Nullable<Another>;
}
    `,
    `
import { Nullable } from 'nullable';
function foo(a: Nullable) {
  console.log(a);
}
foo();
    `,
    `
import { Nullable } from 'nullable';
function foo(): Nullable {
  return null;
}
foo();
    `,
    `
import { Nullable } from 'nullable';
import { SomeOther } from 'some';
class A extends Nullable<SomeOther> {
  other: Nullable<Another>;
}
new A();
    `,
    `
import { Nullable } from 'nullable';
import { SomeOther } from 'some';
import { Another } from 'some';
class A extends Nullable<SomeOther> {
  do(a: Nullable<Another>) {
    console.log(a);
  }
}
new A();
    `,
    `
import { Nullable } from 'nullable';
import { SomeOther } from 'some';
import { Another } from 'some';
export interface A extends Nullable<SomeOther> {
  other: Nullable<Another>;
}
    `,
    `
import { Nullable } from 'nullable';
import { SomeOther } from 'some';
import { Another } from 'some';
export interface A extends Nullable<SomeOther> {
  do(a: Nullable<Another>);
}
    `,
    `
import { Foo } from './types';

class Bar<T extends Foo> {
  prop: T;
}

new Bar<number>();
    `,
    `
import { Foo, Bar } from './types';

class Baz<T extends Foo & Bar> {
  prop: T;
}

new Baz<any>();
    `,
    `
import { Foo } from './types';

class Bar<T = Foo> {
  prop: T;
}

new Bar<number>();
    `,
    `
import { Foo } from './types';

class Foo<T = any> {
  prop: T;
}

new Foo();
    `,
    `
import { Foo } from './types';

class Foo<T = {}> {
  prop: T;
}

new Foo();
    `,
    `
import { Foo } from './types';

class Foo<T extends {} = {}> {
  prop: T;
}

new Foo();
    `,
    `
type Foo = 'a' | 'b' | 'c';
type Bar = number;

export const map: { [name in Foo]: Bar } = {
  a: 1,
  b: 2,
  c: 3,
};
    `,
    // 4.1 remapped mapped type
    noFormat`
type Foo = 'a' | 'b' | 'c';
type Bar = number;

export const map: { [name in Foo as string]: Bar } = {
  a: 1,
  b: 2,
  c: 3,
};
    `,
    `
import { Nullable } from 'nullable';
class A<T> {
  bar: T;
}
new A<Nullable>();
    `,
    `
import { Nullable } from 'nullable';
import { SomeOther } from 'other';
function foo<T extends Nullable>(): T {}
foo<SomeOther>();
    `,
    `
import { Nullable } from 'nullable';
import { SomeOther } from 'other';
class A<T extends Nullable> {
  bar: T;
}
new A<SomeOther>();
    `,
    `
import { Nullable } from 'nullable';
import { SomeOther } from 'other';
interface A<T extends Nullable> {
  bar: T;
}
export const a: A<SomeOther> = {
  foo: 'bar',
};
    `,
    // https://github.com/bradzacher/eslint-plugin-typescript/issues/150
    `
export class App {
  constructor(private logger: Logger) {
    console.log(this.logger);
  }
}
    `,
    `
export class App {
  constructor(bar: string);
  constructor(private logger: Logger) {
    console.log(this.logger);
  }
}
    `,
    `
export class App {
  constructor(baz: string, private logger: Logger) {
    console.log(baz);
    console.log(this.logger);
  }
}
    `,
    `
export class App {
  constructor(baz: string, private logger: Logger, private bar: () => void) {
    console.log(this.logger);
    this.bar();
  }
}
    `,
    `
export class App {
  constructor(private logger: Logger) {}
  meth() {
    console.log(this.logger);
  }
}
    `,
    // https://github.com/bradzacher/eslint-plugin-typescript/issues/126
    `
import { Component, Vue } from 'vue-property-decorator';
import HelloWorld from './components/HelloWorld.vue';

@Component({
  components: {
    HelloWorld,
  },
})
export default class App extends Vue {}
    `,
    // https://github.com/bradzacher/eslint-plugin-typescript/issues/189
    `
import firebase, { User } from 'firebase/app';
// initialize firebase project
firebase.initializeApp({});
export function authenticated(cb: (user: User | null) => void): void {
  firebase.auth().onAuthStateChanged(user => cb(user));
}
    `,
    // https://github.com/bradzacher/eslint-plugin-typescript/issues/33
    `
import { Foo } from './types';
export class Bar<T extends Foo> {
  prop: T;
}
    `,
    `
import webpack from 'webpack';
export default function webpackLoader(this: webpack.loader.LoaderContext) {}
    `,
    `
import execa, { Options as ExecaOptions } from 'execa';
export function foo(options: ExecaOptions): execa {
  options();
}
    `,
    `
import { Foo, Bar } from './types';
export class Baz<F = Foo & Bar> {
  prop: F;
}
    `,
    `
// warning 'B' is defined but never used
export const a: Array<{ b: B }> = [];
    `,
    `
export enum FormFieldIds {
  PHONE = 'phone',
  EMAIL = 'email',
}
    `,
    `
enum FormFieldIds {
  PHONE = 'phone',
  EMAIL = 'email',
}
export interface IFoo {
  fieldName: FormFieldIds;
}
    `,
    `
enum FormFieldIds {
  PHONE = 'phone',
  EMAIL = 'email',
}
export interface IFoo {
  fieldName: FormFieldIds.EMAIL;
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/25
    `
import * as fastify from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
const server: fastify.FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = fastify({});
server.get('/ping');
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/61
    `
declare namespace Foo {
  function bar(line: string, index: number | null, tabSize: number): number;
  var baz: string;
}
console.log(Foo);
    `,
    `
import foo from 'foo';
export interface Bar extends foo.i18n {}
    `,
    `
import foo from 'foo';
import bar from 'foo';
export interface Bar extends foo.i18n<bar> {}
    `,
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/141
      filename: 'test.tsx',
      code: `
import { TypeA } from './interface';
export const a = <GenericComponent<TypeA> />;
      `,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/160
      filename: 'test.tsx',
      code: `
const text = 'text';
export function Foo() {
  return (
    <div>
      <input type="search" size={30} placeholder={text} />
    </div>
  );
}
      `,
    },
    // https://github.com/eslint/typescript-eslint-parser/issues/535
    `
import { observable } from 'mobx';
export default class ListModalStore {
  @observable
  orderList: IObservableArray<BizPurchaseOrderTO> = observable([]);
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/122#issuecomment-462008078
    `
import { Dec, TypeA, Class } from 'test';
export default class Foo {
  constructor(
    @Dec(Class)
    private readonly prop: TypeA<Class>,
  ) {}
}
    `,
    `
import { Dec, TypeA, Class } from 'test';
export default class Foo {
  constructor(
    @Dec(Class)
    ...prop: TypeA<Class>
  ) {
    prop();
  }
}
    `,
    `
export function foo(): void;
export function foo(): void;
export function foo(): void {}
    `,
    `
export function foo(a: number): number;
export function foo(a: string): string;
export function foo(a: number | string): number | string {
  return a;
}
    `,
    `
export function foo<T>(a: number): T;
export function foo<T>(a: string): T;
export function foo<T>(a: number | string): T {
  return a;
}
    `,
    `
export type T = {
  new (): T;
  new (arg: number): T;
  new <T>(arg: number): T;
};
    `,
    `
export type T = new () => T;
export type T = new (arg: number) => T;
export type T = new <T>(arg: number) => T;
    `,
    `
enum Foo {
  a,
}
export type T = {
  [Foo.a]: 1;
};
    `,
    `
namespace Foo {
  export const Foo = 1;
}

export { Foo };
    `,
    `
export namespace Foo {
  export const item: Foo = 1;
}
    `,
    // exported self-referencing types
    `
export interface Foo {
  bar: string;
  baz: Foo['bar'];
}
    `,
    `
export type Bar = Array<Bar>;
    `,
    // declaration merging
    `
function Foo() {}

namespace Foo {
  export const x = 1;
}

export { Foo };
    `,
    `
class Foo {}

namespace Foo {
  export const x = 1;
}

export { Foo };
    `,
    `
namespace Foo {}

const Foo = 1;

export { Foo };
    `,
    `
type Foo = {
  error: Error | null;
};

export function foo() {
  return new Promise<Foo>();
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/2331
    {
      code: `
export interface Event<T> {
  (
    listener: (e: T) => any,
    thisArgs?: any,
    disposables?: Disposable[],
  ): Disposable;
}
      `,
      options: [
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_$',
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2369
    `
export default function (@Optional() value = []) {
  return value;
}

function Optional() {
  return () => {};
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/2417
    `
import { FooType } from './fileA';

export abstract class Foo {
  protected abstract readonly type: FooType;
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/2449
    `
export type F<A extends unknown[]> = (...a: A) => unknown;
    `,
    `
import { Foo } from './bar';
export type F<A extends unknown[]> = (...a: Foo<A>) => unknown;
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/2452
    `
type StyledPaymentProps = {
  isValid: boolean;
};

export const StyledPayment = styled.div<StyledPaymentProps>\`\`;
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/2453
    `
import type { foo } from './a';
export type Bar = typeof foo;
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/2456
    {
      code: `
interface Foo {}
type Bar = {};
declare class Clazz {}
declare function func();
declare enum Enum {}
declare namespace Name {}
declare const v1 = 1;
declare var v2 = 1;
declare let v3 = 1;
declare const { v4 };
declare const { v4: v5 };
declare const [v6];
      `,
      filename: 'foo.d.ts',
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2459
    `
export type Test<U> = U extends (k: infer I) => void ? I : never;
    `,
    `
export type Test<U> = U extends { [k: string]: infer I } ? I : never;
    `,
    `
export type Test<U> = U extends (arg: {
  [k: string]: (arg2: infer I) => void;
}) => void
  ? I
  : never;
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/2455
    {
      code: `
        import React from 'react';

        export const ComponentFoo: React.FC = () => {
          return <div>Foo Foo</div>;
        };
      `,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: `
        import { h } from 'some-other-jsx-lib';

        export const ComponentFoo: h.FC = () => {
          return <div>Foo Foo</div>;
        };
      `,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        jsxPragma: 'h',
      },
    },
    {
      code: `
        import { Fragment } from 'react';

        export const ComponentFoo: Fragment = () => {
          return <>Foo Foo</>;
        };
      `,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        jsxFragmentName: 'Fragment',
      },
    },
    `
declare module 'foo' {
  type Test = 1;
}
    `,
    `
declare module 'foo' {
  type Test = 1;
  const x: Test = 1;
  export = x;
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/2523
    `
declare global {
  interface Foo {}
}
    `,
    `
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeSeven: () => R;
    }
  }
}
    `,
    `
export declare namespace Foo {
  namespace Bar {
    namespace Baz {
      namespace Bam {
        const x = 1;
      }
    }
  }
}
    `,
    {
      code: `
declare namespace A {
  export interface A {}
}
      `,
      filename: 'foo.d.ts',
    },
    {
      code: `
declare function A(A: string): string;
      `,
      filename: 'foo.d.ts',
    },
    // 4.1 template literal types
    noFormat`
type Color = 'red' | 'blue';
type Quantity = 'one' | 'two';
export type SeussFish = \`\${Quantity | Color} fish\`;
    `,
    noFormat`
type VerticalAlignment = "top" | "middle" | "bottom";
type HorizontalAlignment = "left" | "center" | "right";

export declare function setAlignment(value: \`\${VerticalAlignment}-\${HorizontalAlignment}\`): void;
    `,
    noFormat`
type EnthusiasticGreeting<T extends string> = \`\${Uppercase<T>} - \${Lowercase<T>} - \${Capitalize<T>} - \${Uncapitalize<T>}\`;
export type HELLO = EnthusiasticGreeting<"heLLo">;
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/2714
    {
      code: `
interface IItem {
  title: string;
  url: string;
  children?: IItem[];
}
      `,
      // unreported because it's in a decl file, even though it's only self-referenced
      filename: 'foo.d.ts',
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2648
    {
      code: `
namespace _Foo {
  export const bar = 1;
  export const baz = Foo.bar;
}
      `,
      // ignored by pattern, even though it's only self-referenced
      options: [{ varsIgnorePattern: '^_' }],
    },
    {
      code: `
interface _Foo {
  a: string;
  b: Foo;
}
      `,
      // ignored by pattern, even though it's only self-referenced
      options: [{ varsIgnorePattern: '^_' }],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2844
    `
/* eslint collect-unused-vars: "error" */
declare module 'next-auth' {
  interface User {
    id: string;
    givenName: string;
    familyName: string;
  }
}
    `,
  ],

  invalid: [
    {
      code: `
import { ClassDecoratorFactory } from 'decorators';
export class Foo {}
      `,
      errors: [
        {
          messageId: 'unusedVar',
          data: {
            varName: 'ClassDecoratorFactory',
            action: 'defined',
            additional: '',
          },
          line: 2,
          column: 10,
        },
      ],
    },
    {
      code: `
import { Foo, Bar } from 'foo';
function baz<Foo>(): Foo {}
baz<Bar>();
      `,
      errors: [
        {
          messageId: 'unusedVar',
          data: {
            varName: 'Foo',
            action: 'defined',
            additional: '',
          },
          line: 2,
          column: 10,
        },
      ],
    },
    {
      code: `
import { Nullable } from 'nullable';
const a: string = 'hello';
console.log(a);
      `,
      errors: [
        {
          messageId: 'unusedVar',
          data: {
            varName: 'Nullable',
            action: 'defined',
            additional: '',
          },
          line: 2,
          column: 10,
        },
      ],
    },
    {
      code: `
import { Nullable } from 'nullable';
import { SomeOther } from 'other';
const a: Nullable<string> = 'hello';
console.log(a);
      `,
      errors: [
        {
          messageId: 'unusedVar',
          data: {
            varName: 'SomeOther',
            action: 'defined',
            additional: '',
          },
          line: 3,
          column: 10,
        },
      ],
    },

    {
      code: `
import { Nullable } from 'nullable';
import { Another } from 'some';
class A {
  do = (a: Nullable) => {
    console.log(a);
  };
}
new A();
      `,
      errors: [
        {
          messageId: 'unusedVar',
          data: {
            varName: 'Another',
            action: 'defined',
            additional: '',
          },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
import { Nullable } from 'nullable';
import { Another } from 'some';
class A {
  do(a: Nullable) {
    console.log(a);
  }
}
new A();
      `,
      errors: [
        {
          messageId: 'unusedVar',
          data: {
            varName: 'Another',
            action: 'defined',
            additional: '',
          },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
import { Nullable } from 'nullable';
import { Another } from 'some';
class A {
  do(): Nullable {
    return null;
  }
}
new A();
      `,
      errors: [
        {
          messageId: 'unusedVar',
          data: {
            varName: 'Another',
            action: 'defined',
            additional: '',
          },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
import { Nullable } from 'nullable';
import { Another } from 'some';
export interface A {
  do(a: Nullable);
}
      `,
      errors: [
        {
          messageId: 'unusedVar',
          data: {
            varName: 'Another',
            action: 'defined',
            additional: '',
          },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
import { Nullable } from 'nullable';
import { Another } from 'some';
export interface A {
  other: Nullable;
}
      `,
      errors: [
        {
          messageId: 'unusedVar',
          data: {
            varName: 'Another',
            action: 'defined',
            additional: '',
          },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
import { Nullable } from 'nullable';
function foo(a: string) {
  console.log(a);
}
foo();
      `,
      errors: [
        {
          messageId: 'unusedVar',
          data: {
            varName: 'Nullable',
            action: 'defined',
            additional: '',
          },
          line: 2,
          column: 10,
        },
      ],
    },
    {
      code: `
import { Nullable } from 'nullable';
function foo(): string | null {
  return null;
}
foo();
      `,
      errors: [
        {
          messageId: 'unusedVar',
          data: {
            varName: 'Nullable',
            action: 'defined',
            additional: '',
          },
          line: 2,
          column: 10,
        },
      ],
    },
    {
      code: `
import { Nullable } from 'nullable';
import { SomeOther } from 'some';
import { Another } from 'some';
class A extends Nullable {
  other: Nullable<Another>;
}
new A();
      `,
      errors: [
        {
          messageId: 'unusedVar',
          data: {
            varName: 'SomeOther',
            action: 'defined',
            additional: '',
          },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
import { Nullable } from 'nullable';
import { SomeOther } from 'some';
import { Another } from 'some';
abstract class A extends Nullable {
  other: Nullable<Another>;
}
new A();
      `,
      errors: [
        {
          messageId: 'unusedVar',
          data: {
            varName: 'SomeOther',
            action: 'defined',
            additional: '',
          },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
enum FormFieldIds {
  PHONE = 'phone',
  EMAIL = 'email',
}
      `,
      errors: [
        {
          messageId: 'unusedVar',
          data: {
            varName: 'FormFieldIds',
            action: 'defined',
            additional: '',
          },
          line: 2,
          column: 6,
        },
      ],
    },
    {
      code: `
import test from 'test';
import baz from 'baz';
export interface Bar extends baz.test {}
      `,
      errors: [
        {
          messageId: 'unusedVar',
          data: {
            varName: 'test',
            action: 'defined',
            additional: '',
          },
          line: 2,
          column: 8,
        },
      ],
    },
    {
      code: `
import test from 'test';
import baz from 'baz';
export interface Bar extends baz().test {}
      `,
      errors: [
        {
          messageId: 'unusedVar',
          data: {
            varName: 'test',
            action: 'defined',
            additional: '',
          },
          line: 2,
          column: 8,
        },
      ],
    },
    {
      code: `
import test from 'test';
import baz from 'baz';
export class Bar implements baz.test {}
      `,
      errors: [
        {
          messageId: 'unusedVar',
          data: {
            varName: 'test',
            action: 'defined',
            additional: '',
          },
          line: 2,
          column: 8,
        },
      ],
    },
    {
      code: `
import test from 'test';
import baz from 'baz';
export class Bar implements baz().test {}
      `,
      errors: [
        {
          messageId: 'unusedVar',
          data: {
            varName: 'test',
            action: 'defined',
            additional: '',
          },
          line: 2,
          column: 8,
        },
      ],
    },
    {
      code: `
namespace Foo {}
      `,
      errors: [
        {
          messageId: 'unusedVar',
          data: {
            varName: 'Foo',
            action: 'defined',
            additional: '',
          },
          line: 2,
          column: 11,
        },
      ],
    },
    {
      code: `
namespace Foo {
  export const Foo = 1;
}
      `,
      errors: [
        {
          messageId: 'unusedVar',
          data: {
            varName: 'Foo',
            action: 'defined',
            additional: '',
          },
          line: 2,
          column: 11,
        },
      ],
    },
    {
      code: `
namespace Foo {
  const Foo = 1;
  console.log(Foo);
}
      `,
      errors: [
        {
          messageId: 'unusedVar',
          data: {
            varName: 'Foo',
            action: 'defined',
            additional: '',
          },
          line: 2,
          column: 11,
        },
      ],
    },
    {
      code: `
namespace Foo {
  export const Bar = 1;
  console.log(Foo.Bar);
}
      `,
      errors: [
        {
          messageId: 'unusedVar',
          data: {
            varName: 'Foo',
            action: 'defined',
            additional: '',
          },
          line: 4,
          column: 15,
        },
      ],
    },
    {
      code: `
namespace Foo {
  namespace Foo {
    export const Bar = 1;
    console.log(Foo.Bar);
  }
}
      `,
      errors: [
        {
          messageId: 'unusedVar',
          data: {
            varName: 'Foo',
            action: 'defined',
            additional: '',
          },
          line: 2,
          column: 11,
        },
        {
          messageId: 'unusedVar',
          data: {
            varName: 'Foo',
            action: 'defined',
            additional: '',
          },
          line: 5,
          column: 17,
        },
      ],
    },
    // self-referencing types
    {
      code: `
interface Foo {
  bar: string;
  baz: Foo['bar'];
}
      `,
      errors: [
        {
          messageId: 'unusedVar',
          line: 4,
          data: {
            varName: 'Foo',
            action: 'defined',
            additional: '',
          },
        },
      ],
    },
    {
      code: `
type Foo = Array<Foo>;
      `,
      errors: [
        {
          messageId: 'unusedVar',
          line: 2,
          data: {
            varName: 'Foo',
            action: 'defined',
            additional: '',
          },
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2455
    {
      code: `
import React from 'react';
import { Fragment } from 'react';

export const ComponentFoo = () => {
  return <div>Foo Foo</div>;
};
      `,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      errors: [
        {
          messageId: 'unusedVar',
          line: 3,
          data: {
            varName: 'Fragment',
            action: 'defined',
            additional: '',
          },
        },
      ],
    },
    {
      code: `
import React from 'react';
import { h } from 'some-other-jsx-lib';

export const ComponentFoo = () => {
  return <div>Foo Foo</div>;
};
      `,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        jsxPragma: 'h',
      },
      errors: [
        {
          messageId: 'unusedVar',
          line: 2,
          data: {
            varName: 'React',
            action: 'defined',
            additional: '',
          },
        },
      ],
    },
    {
      code: `
declare module 'foo' {
  type Test = any;
  const x = 1;
  export = x;
}
      `,
      errors: [
        {
          messageId: 'unusedVar',
          line: 3,
          data: {
            varName: 'Test',
            action: 'defined',
            additional: '',
          },
        },
      ],
    },
    {
      code: `
// not declared
export namespace Foo {
  namespace Bar {
    namespace Baz {
      namespace Bam {
        const x = 1;
      }
    }
  }
}
      `,
      errors: [
        {
          messageId: 'unusedVar',
          line: 4,
          data: {
            varName: 'Bar',
            action: 'defined',
            additional: '',
          },
        },
        {
          messageId: 'unusedVar',
          line: 5,
          data: {
            varName: 'Baz',
            action: 'defined',
            additional: '',
          },
        },
        {
          messageId: 'unusedVar',
          line: 6,
          data: {
            varName: 'Bam',
            action: 'defined',
            additional: '',
          },
        },
        {
          messageId: 'unusedVar',
          line: 7,
          data: {
            varName: 'x',
            action: 'assigned a value',
            additional: '',
          },
        },
      ],
    },
    {
      code: `
interface Foo {
  a: string;
}
interface Foo {
  b: Foo;
}
      `,
      errors: [
        {
          messageId: 'unusedVar',
          line: 6,
          data: {
            varName: 'Foo',
            action: 'defined',
            additional: '',
          },
        },
      ],
    },
  ],
});
