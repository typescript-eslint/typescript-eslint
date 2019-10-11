import rule from '../../src/rules/no-unused-vars';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {},
  },
  parser: '@typescript-eslint/parser',
});

// the base rule doesn't have messageIds
function error(
  messages: { message: string; line: number; column: number }[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any[] {
  return messages;
}

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
    constructor(@ConstructorParameterDecoratorFactory(APP_CONFIG) config: AppConfig) {
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
new Thing()
		`,
    `
interface Base {}
const a: Base = {}
console.log(a);
        `,
    `
import { Foo } from 'foo'
function bar<T>() {}
bar<Foo>()
        `,
    `
import { Foo } from 'foo'
const bar = function <T>() {}
bar<Foo>()
        `,
    `
import { Foo } from 'foo'
const bar = <T>() => {}
bar<Foo>()
        `,
    `
import { Foo } from 'foo'
<Foo>(<T>() => {})()
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
class Foo implements Component<Nullable>{};

new Foo();
		`,
    `
import { Nullable } from 'nullable';
import { Component } from 'react';
class Foo extends Component<Nullable, {}>{}
new Foo();
		`,
    `
import { Nullable } from 'nullable';
import { SomeOther } from 'some';
import { Component } from 'react';
class Foo extends Component<Nullable<SomeOther>, {}>{}
new Foo();
		`,
    `
import { Nullable } from 'nullable';
import { SomeOther } from 'some';
import { Component } from 'react';
class Foo implements Component<Nullable<SomeOther>, {}>{}
new Foo();
		`,
    `
import { Nullable } from 'nullable';
import { SomeOther } from 'some';
import { Component, Component2 } from 'react';
class Foo implements Component<Nullable<SomeOther>, {}>, Component2{}
new Foo();
		`,
    `
import { Nullable } from 'nullable';
import { Another } from 'some';
class A {
    do = (a: Nullable<Another>) => { console.log(a); }
}
new A();
		`,
    `
import { Nullable } from 'nullable';
import { Another } from 'some';
class A {
    do(a: Nullable<Another>) { console.log(a); }
}
new A();
		`,
    `
import { Nullable } from 'nullable';
import { Another } from 'some';
class A {
    do(): Nullable<Another> { return null; }
}
new A();
		`,
    `
import { Nullable } from 'nullable';
import { Another } from 'some';
interface A {
    do(a: Nullable<Another>);
}
		`,
    `
import { Nullable } from 'nullable';
import { Another } from 'some';
interface A {
    other: Nullable<Another>;
}
		`,
    `
import { Nullable } from 'nullable';
function foo(a: Nullable) { console.log(a); }
foo();
		`,
    `
import { Nullable } from 'nullable';
function foo(): Nullable { return null; }
foo();
		`,
    `
import { Nullable } from 'nullable';
import { SomeOther } from 'some';
import { Another } from 'some';
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
    do(a: Nullable<Another>){ console.log(a); }
}
new A();
		`,
    `
import { Nullable } from 'nullable';
import { SomeOther } from 'some';
import { Another } from 'some';
interface A extends Nullable<SomeOther> {
    other: Nullable<Another>;
}
		`,
    `
import { Nullable } from 'nullable';
import { SomeOther } from 'some';
import { Another } from 'some';
interface A extends Nullable<SomeOther> {
    do(a: Nullable<Another>);
}
        `,
    `
import { Foo } from './types';

class Bar<T extends Foo> {}

new Bar<number>()
        `,
    `
import { Foo, Bar } from './types';

class Baz<T extends Foo & Bar> {}

new Baz<any>()
        `,
    `
import { Foo } from './types';

class Bar<T = Foo> {}

new Bar<number>()
        `,
    `
import { Foo } from './types';

class Foo<T = any> {}

new Foo()
        `,
    `
import { Foo } from './types';

class Foo<T = {}> {}

new Foo()
        `,
    `
import { Foo } from './types';

class Foo<T extends {} = {}> {}

new Foo()
        `,
    `
type Foo = "a" | "b" | "c"
type Bar = number

export const map: { [name in Foo]: Bar } = {
    a: 1,
    b: 2,
    c: 3
}
        `,
    `
import { Nullable } from 'nullable';
class A<T> {
    bar: T
}
new A<Nullable>();
        `,
    `
import { Nullable } from 'nullable';
import { SomeOther } from 'other';
function foo<T extends Nullable>() {
}
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
    foo: "bar"
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
    HelloWorld
  }
})
export default class App extends Vue {}
        `,
    // https://github.com/bradzacher/eslint-plugin-typescript/issues/189
    `
import firebase, {User} from 'firebase/app'
// initialize firebase project
firebase.initializeApp({
})
export function authenticated(cb: (user: User | null) => void): void {
  firebase.auth().onAuthStateChanged(user => cb(user))
}
        `,
    // https://github.com/bradzacher/eslint-plugin-typescript/issues/33
    `
import { Foo } from './types';
export class Bar<T extends Foo> {}
        `,
    `
import webpack from 'webpack';
export default function webpackLoader(this: webpack.loader.LoaderContext) {}
        `,
    `
import execa, { Options as ExecaOptions } from 'execa';
export function foo(options: ExecaOptions): execa {
    options()
}
        `,
    `
import { Foo, Bar } from './types';
export class Baz<F = Foo & Bar> {}
        `,
    `
// warning 'B' is defined but never used
export const a: Array<{b: B}> = []
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
interface IFoo {
	fieldName: FormFieldIds,
}
        `,
    `
enum FormFieldIds {
    PHONE = 'phone',
    EMAIL = 'email',
}
interface IFoo {
    fieldName: FormFieldIds.EMAIL,
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/25
    `
import * as fastify from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'
const server: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({})
server.get('/ping')
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/61
    `declare function foo();`,
    // https://github.com/typescript-eslint/typescript-eslint/issues/61
    `
declare namespace Foo {
    function bar(line: string, index: number | null, tabSize: number): number;
    var baz: string;
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/61
    `
declare var Foo: {
    new (value?: any): Object,
    foo(): string
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/106
    `
declare class Foo {
    constructor(value?: any): Object;
    foo(): string;
}
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
    ...prop: TypeA<Class>,
  ) {
    prop()
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
      errors: error([
        {
          message: "'ClassDecoratorFactory' is defined but never used.",
          line: 2,
          column: 10,
        },
      ]),
    },
    {
      code: `
import { Foo, Bar } from 'foo';
function baz<Foo>() {}
baz<Bar>()
            `,
      errors: error([
        {
          message: "'Foo' is defined but never used.",
          line: 2,
          column: 10,
        },
      ]),
    },
    {
      code: `
import { Nullable } from 'nullable';
const a: string = 'hello';
console.log(a);
            `,
      errors: error([
        {
          message: "'Nullable' is defined but never used.",
          line: 2,
          column: 10,
        },
      ]),
    },
    {
      code: `
import { Nullable } from 'nullable';
import { SomeOther } from 'other';
const a: Nullable<string> = 'hello';
console.log(a);
            `,
      errors: error([
        {
          message: "'SomeOther' is defined but never used.",
          line: 3,
          column: 10,
        },
      ]),
    },

    {
      code: `
import { Nullable } from 'nullable';
import { Another } from 'some';
class A {
    do = (a: Nullable) => { console.log(a); }
}
new A();
            `,
      errors: error([
        {
          message: "'Another' is defined but never used.",
          line: 3,
          column: 10,
        },
      ]),
    },
    {
      code: `
import { Nullable } from 'nullable';
import { Another } from 'some';
class A {
    do(a: Nullable) { console.log(a); }
}
new A();
            `,
      errors: error([
        {
          message: "'Another' is defined but never used.",
          line: 3,
          column: 10,
        },
      ]),
    },
    {
      code: `
import { Nullable } from 'nullable';
import { Another } from 'some';
class A {
    do(): Nullable { return null; }
}
new A();
            `,
      errors: error([
        {
          message: "'Another' is defined but never used.",
          line: 3,
          column: 10,
        },
      ]),
    },
    {
      code: `
import { Nullable } from 'nullable';
import { Another } from 'some';
interface A {
    do(a: Nullable);
}
            `,
      errors: error([
        {
          message: "'Another' is defined but never used.",
          line: 3,
          column: 10,
        },
      ]),
    },
    {
      code: `
import { Nullable } from 'nullable';
import { Another } from 'some';
interface A {
    other: Nullable;
}
            `,
      errors: error([
        {
          message: "'Another' is defined but never used.",
          line: 3,
          column: 10,
        },
      ]),
    },
    {
      code: `
import { Nullable } from 'nullable';
function foo(a: string) { console.log(a); }
foo();
            `,
      errors: error([
        {
          message: "'Nullable' is defined but never used.",
          line: 2,
          column: 10,
        },
      ]),
    },
    {
      code: `
import { Nullable } from 'nullable';
function foo(): string | null { return null; }
foo();
            `,
      errors: error([
        {
          message: "'Nullable' is defined but never used.",
          line: 2,
          column: 10,
        },
      ]),
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
      errors: error([
        {
          message: "'SomeOther' is defined but never used.",
          line: 3,
          column: 10,
        },
      ]),
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
      errors: error([
        {
          message: "'SomeOther' is defined but never used.",
          line: 3,
          column: 10,
        },
      ]),
    },
    {
      code: `
enum FormFieldIds {
    PHONE = 'phone',
    EMAIL = 'email',
}
            `,
      errors: error([
        {
          message: "'FormFieldIds' is defined but never used.",
          line: 2,
          column: 6,
        },
      ]),
    },
    {
      code: `
import test from 'test';
import baz from 'baz';
export interface Bar extends baz.test {}
    `,
      errors: error([
        {
          message: "'test' is defined but never used.",
          line: 2,
          column: 8,
        },
      ]),
    },
    {
      code: `
import test from 'test';
import baz from 'baz';
export interface Bar extends baz().test {}
    `,
      errors: error([
        {
          message: "'test' is defined but never used.",
          line: 2,
          column: 8,
        },
      ]),
    },
    {
      code: `
import test from 'test';
import baz from 'baz';
export class Bar implements baz.test {}
    `,
      errors: error([
        {
          message: "'test' is defined but never used.",
          line: 2,
          column: 8,
        },
      ]),
    },
    {
      code: `
import test from 'test';
import baz from 'baz';
export class Bar implements baz().test {}
    `,
      errors: error([
        {
          message: "'test' is defined but never used.",
          line: 2,
          column: 8,
        },
      ]),
    },
  ],
});
