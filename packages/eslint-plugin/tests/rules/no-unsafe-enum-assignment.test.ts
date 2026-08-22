import rule from '../../src/rules/no-unsafe-enum-assignment';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-unsafe-enum-assignment', rule, {
  valid: [
    `
enum Fruit {
  Apple,
}

const fruit: Fruit = Fruit.Apple;
    `,
    `
enum Fruit {
  Apple,
}

const getFruit = (): Fruit => Fruit.Apple;
    `,
    `
enum Fruit {
  Apple,
}

class Basket {
  fruit: Fruit = Fruit.Apple;
}
    `,
    `
enum Fruit {
  Apple,
}

const box: { fruit: Fruit } = { fruit: Fruit.Apple };
    `,
    {
      code: `
enum Fruit {
  Apple,
}

declare function Basket(props: { fruit: Fruit }): JSX.Element;

<Basket fruit={Fruit.Apple} />;
      `,
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    `
({ fruit: 1 });
    `,
    `
enum Fruit {
  Apple,
}

const fruits: [Fruit] = [Fruit.Apple];
void fruits;
    `,
    `
enum Fruit {
  Apple,
}

const [fruit]: Fruit[] = [Fruit.Apple];
void fruit;
    `,
    `
enum Fruit {
  Apple,
}

const [fruit]: [Fruit] = [Fruit.Apple] as Fruit[];
void fruit;
    `,
    `
enum Fruit {
  Apple,
}

let fruit: Fruit;
[fruit] = [Fruit.Apple];
void fruit;
    `,
    `
enum Fruit {
  Apple,
}

function takeFruit([fruit]: Fruit[] = [Fruit.Apple]): void {
  void fruit;
}
    `,
    `
enum Fruit {
  Apple,
}

const getFruit = (): Fruit => {
  return Fruit.Apple;
};

void getFruit;
    `,
    `
enum Fruit {
  Apple,
}

function takesFruits(...fruits: Fruit[]): void {}

const fruits: Fruit[] = [Fruit.Apple];
takesFruits(...fruits);
    `,
    `
enum Fruit {
  Apple,
}

declare const foo: { plain: string };

foo[0];
    `,
    `
enum Fruit {
  Apple,
}

({})[0];
    `,
    `
enum Fruit {
  Apple,
}

const [fruit]: [Fruit] = [Fruit.Apple];
void fruit;
    `,
    `
enum Fruit {
  Apple,
}

const { fruit }: { fruit: Fruit } = {} as {};
void fruit;
    `,
    `
enum Fruit {
  Apple,
}

declare const fruitKey: unique symbol;

type Basket = { [fruitKey]: Fruit };

const { [fruitKey]: fruit }: Basket = { [fruitKey]: Fruit.Apple };
void fruit;
    `,
    `
enum Fruit {
  Apple,
}

declare const fruitKey: unique symbol;

interface Basket {
  [fruitKey]: Fruit;
}

class TestBasket implements Basket {
  [fruitKey] = Fruit.Apple;
}
    `,
    `
enum Fruit {
  Apple,
}

const fruit = Fruit.Apple as Fruit;
    `,
    `
enum Fruit {
  Apple,
}

class Basket {
  fruit = Fruit.Apple;
}
    `,
    `
enum Fruit {
  Apple,
}

interface Basket {
  fruit: Fruit;
}

class TestBasket implements Basket {
  fruit = Fruit.Apple;
}
    `,
    `
enum Fruit {
  Apple,
}

declare const foo: { [key in Fruit]: string };

foo[Fruit.Apple];
foo?.[Fruit.Apple];
    `,
    `
enum Fruit {
  Apple,
}

declare const foo: { [key in Fruit | number]: string };

foo[0];
    `,
    `
enum Fruit {
  Apple,
}

declare const something: any;

const fruit: Fruit = something;
    `,
    `
enum Fruit {
  Apple,
}

declare const something: any;

function takesFruit(fruit: Fruit): void {}

takesFruit(something);
    `,
    `
enum Fruit {
  Apple,
}

declare const something: unknown;

const fruit: Fruit = something as Fruit;
    `,
    `
enum Fruit {
  Apple,
}

function takesFruitOrNull(fruit: Fruit | null): void {}

takesFruitOrNull(null);
    `,
    `
enum Fruit {
  Apple,
}

function takesFruitOrUndefined(fruit: Fruit | undefined): void {}

takesFruitOrUndefined(undefined);
    `,
    `
enum Fruit {
  Apple,
  Banana,
}

declare const apple: Fruit;

const fruit: Fruit = apple;
    `,
    `
const enum Direction {
  Up,
  Down,
}

const dir: Direction = Direction.Up;
    `,
    `
enum Flags {
  Read = 1 << 0,
  Write = 1 << 1,
}

const combined: Flags = Flags.Read | Flags.Write;
    `,
    `
enum Flags {
  Read = 1 << 0,
  Write = 1 << 1,
}

let flags: Flags = Flags.Read;
flags |= Flags.Write;
flags &= Flags.Read;
flags ^= Flags.Write;
    `,
    `
enum Fruit {
  Apple,
}

let fruit: Fruit | undefined;
fruit ??= Fruit.Apple;
fruit ||= Fruit.Apple;
fruit &&= Fruit.Apple;
    `,
    `
enum Fruit {
  Apple,
}

let count = 1;
count++;
count += 1;
void Fruit;
    `,
    `
enum Fruit {
  Apple,
}

declare const fruits: Record<Fruit, string>;

const hasApple = 0 in fruits;
    `,
    `
enum Fruit {
  Apple,
}

type Mapped<T> = { [K in keyof T]: T[K] };

declare const source: Mapped<{ fruit: Fruit }>;

const target: { fruit: Fruit } = source;
    `,
    `
enum Fruit {
  Apple,
}

interface Api<T> {
  extend<U>(value: U): Api<T & U>;
  fruit: T;
}

declare const api: Api<Fruit>;

const extended: Api<Fruit> = api;
    `,
    `
enum Fruit {
  Apple,
}

enum Vegetable {
  Asparagus = 'asparagus',
}

function takesEither(val: Fruit | Vegetable): void {}

takesEither(Fruit.Apple);
takesEither(Vegetable.Asparagus);
    `,
    `
enum Fruit {
  Apple,
}

async function getFruit(): Promise<Fruit> {
  return Fruit.Apple;
}
    `,
    `
enum Fruit {
  Apple,
}

function getFruitOrNull(): Fruit | null {
  return null;
}
    `,
    `
enum Fruit {
  Apple,
}

declare function tag(strings: TemplateStringsArray, fruit: Fruit): string;

tag\`\${Fruit.Apple}\`;
    `,
    `
enum Fruit {
  Apple,
}

class Basket {
  constructor(public fruit: Fruit) {}
}

new Basket(Fruit.Apple);
    `,
    `
enum Fruit {
  Apple,
}

const fruit = Fruit.Apple;
const box: { fruit: Fruit } = { fruit };
    `,
    `
enum Mixed {
  A = 'a',
  B = 1,
}

const val: Mixed = Mixed.A;
const val2: Mixed = Mixed.B;
    `,
    `
enum Fruit {
  Apple,
}

interface HasFruit {
  fruit: Fruit;
}

interface HasNumber {
  fruit: number;
}

class TestBasket implements HasFruit, HasNumber {
  fruit = 1;
}
    `,
    `
enum Fruit {
  Apple,
}

function takesFruit(fruit: Fruit): void {}

takesFruit(...[Fruit.Apple]);
    `,
    `
enum Fruit {
  Apple,
  Banana,
}

const fruits: Fruit[] = [Fruit.Apple, Fruit.Banana];
    `,
    `
enum Fruit {
  Apple,
}

const fruits: Array<Fruit | number> = [1, Fruit.Apple];
    `,
    `
enum Fruit {
  Apple,
}

declare const bar: { [Fruit.Apple]: string };

bar[Fruit.Apple];
bar?.[Fruit.Apple];
    `,
    `
enum Fruit {
  Apple,
}

function takesNothing(): void {}

takesNothing();
    `,
    `
enum Fruit {
  Apple,
}

function takesRest(first: Fruit, ...rest: Fruit[]): void {}

takesRest(Fruit.Apple, Fruit.Apple, Fruit.Apple);
    `,
    `
enum Fruit {
  Apple,
}

function takesFruits(first: Fruit, second: Fruit): void {}

takesFruits(...[Fruit.Apple, ...[Fruit.Apple]]);
    `,
    `
enum Fruit {
  Apple,
}

const { ['fruit']: fruit }: { fruit: Fruit } = { fruit: Fruit.Apple };
void fruit;
    `,
    `
enum Fruit {
  Apple,
}

const [, ...rest]: Fruit[] = [Fruit.Apple, Fruit.Apple];
void rest;
    `,
    `
enum Fruit {
  Apple,
}

let fruit: Fruit;
({ fruit } = { fruit: Fruit.Apple });
    `,
    `
enum Fruit {
  Apple,
}

function pick({ fruit }: { fruit: Fruit } = { fruit: Fruit.Apple }): Fruit {
  return fruit;
}

pick();
    `,
    {
      code: `
enum Vegetable {
  Asparagus = 'asparagus',
}

declare function Basket(props: { vegetable: Vegetable }): JSX.Element;

<Basket vegetable="asparagus" />;
      `,
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    `
enum Fruit {
  Apple,
}

declare const x: Fruit;
const y: Fruit = x;
    `,
    `
enum Fruit {
  Apple,
}

function noop(): void {
  return;
}

noop();
    `,
    `
enum Fruit {
  Apple,
}

const fruits: Fruit[] = [...[Fruit.Apple]];
    `,
    `
enum Fruit {
  Apple,
}

function takeFruit(fruit: Fruit): void {}
takeFruit(...[Fruit.Apple, ...[1]]);
    `,
    `
enum Fruit {
  Apple,
}

function takesGeneric<T extends readonly unknown[]>(...args: T): void {}

takesGeneric(Fruit.Apple);
    `,
    `
enum Flags {
  Read = 1 << 0,
  Write = 1 << 1,
}

const combined: Flags = (Flags.Read as Flags) | Flags.Write;
void combined;
    `,
    `
enum Fruit {
  Apple,
}

interface Basket {
  fruit: Fruit;
}

class Base {
  fruit: Fruit = Fruit.Apple;
}

class Child extends Base implements Basket {
  fruit = Fruit.Apple;
}

void Child;
    `,
    `
enum Fruit {
  Apple,
}

interface Basket {
  fruit: Fruit;
}

class Child implements Basket {
  other = Fruit.Apple;
  fruit: Fruit = Fruit.Apple;
}

void Child;
    `,
    `
enum Fruit {
  Apple,
}

const key = 'fruit' as const;
const { [key]: picked }: { fruit: Fruit } = { fruit: Fruit.Apple };
void picked;
    `,
    `
enum Fruit {
  Apple,
}

const { fruit: picked }: { fruit: Fruit } = { fruit: Fruit.Apple };
void picked;
    `,
    `
enum Flags {
  Read = 1 << 0,
  Write = 1 << 1,
}

const combined: Flags = Flags.Read | (Flags.Write & Flags.Read);
void combined;
    `,
    `
enum Fruit {
  Apple,
}

function takesFruit(fruit: Fruit): void {}
takesFruit(Fruit.Apple, Fruit.Apple);
    `,
    `
enum Fruit {
  Apple,
}

declare const rec: Record<string, string>;
rec[Fruit.Apple];
    `,
    `
enum Fruit {
  Apple,
}

doesNotExist(Fruit.Apple);
    `,
    `
enum Fruit {
  Apple,
}

function takesFruits(fruits: Fruit[]): void {}

takesFruits([Fruit.Apple]);
    `,
    `
enum Fruit {
  Apple,
}

[1];
    `,
    `
const numbers: number[] = [1];
void numbers;
    `,
    `
enum Fruit {
  Apple,
}

interface Basket {
  fruit: Fruit;
}

class TestBasket implements Basket {
  #other = 1;
  fruit = Fruit.Apple;
}

void TestBasket;
    `,
    `
enum Fruit {
  Apple,
}

interface Basket {
  fruit: Fruit;
}

class TestBasket implements Basket {
  other = 1;
  fruit = Fruit.Apple;
}

void TestBasket;
    `,
    `
function foo(): void {}

foo[0];
    `,
    `
const foo = {};

foo[0];
    `,
    {
      code: `
enum Fruit {
  Apple,
}

declare function Basket(props: { fruit?: Fruit }): JSX.Element;

<Basket fruit={/* empty */} />;
      `,
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    `
enum Fruit {
  Apple,
}

function identity<T extends Fruit>(value: T): T {
  const next: T = value;
  return next;
}

identity(Fruit.Apple);
    `,
    `
enum Vegetable {
  Asparagus = 'asparagus',
}

function identity<T extends Vegetable>(value: T): T {
  return value;
}

identity(Vegetable.Asparagus);
    `,
    `
const enum Direction {
  Up,
  Down,
}

function identity<T extends Direction>(value: T): T {
  return value;
}

identity(Direction.Up);
    `,
    `
enum Mixed {
  A = 'a',
  B = 1,
}

function identity<T extends Mixed>(value: T): T {
  return value;
}

identity(Mixed.A);
identity(Mixed.B);
    `,
    `
enum Fruit {
  Apple,
}

function identity<T extends Fruit, V extends T>(value: V): V {
  const next: V = value;
  return next;
}

identity(Fruit.Apple);
    `,
    `
enum Fruit {
  Apple,
}

function takesBox<T extends { fruit: Fruit }>(box: T): T {
  const next: T = box;
  return next;
}

takesBox({ fruit: Fruit.Apple });
    `,
    `
enum Fruit {
  Apple,
}

function takesNestedBox<T extends { box: { fruit: Fruit } }>(box: T): T {
  return box;
}

takesNestedBox({ box: { fruit: Fruit.Apple } });
    `,
    `
enum Fruit {
  Apple,
}

function takesArray<T extends Fruit[]>(value: T): T {
  const next: T = value;
  return next;
}

takesArray([Fruit.Apple]);
    `,
    `
enum Fruit {
  Apple,
}

function takesReadonlyArray<T extends readonly Fruit[]>(value: T): T {
  return value;
}

takesReadonlyArray([Fruit.Apple] as const);
    `,
    `
enum Fruit {
  Apple,
  Banana,
}

function takesTuple<T extends [Fruit, Fruit]>(...value: T): T {
  return value;
}

takesTuple(Fruit.Apple, Fruit.Banana);
    `,
    `
enum Fruit {
  Apple,
  Banana,
}

function takesReadonlyTuple<T extends readonly [Fruit, Fruit]>(value: T): T {
  return value;
}

takesReadonlyTuple([Fruit.Apple, Fruit.Banana] as const);
    `,
    `
enum Fruit {
  Apple,
  Banana,
}

function takesRestTuple<T extends [Fruit, ...Fruit[]]>(...value: T): T {
  return value;
}

takesRestTuple(Fruit.Apple, Fruit.Banana);
    `,
    `
enum Fruit {
  Apple,
}

type Box<T> = { fruit: T };

function takesAliasBox<T extends Fruit>(box: Box<T>): Box<T> {
  return box;
}

takesAliasBox({ fruit: Fruit.Apple });
    `,
    `
enum Fruit {
  Apple,
}

interface Box<T> {
  fruit: T;
}

function takesInterfaceBox<T extends Fruit>(box: Box<T>): Box<T> {
  return box;
}

takesInterfaceBox({ fruit: Fruit.Apple });
    `,
    `
enum Fruit {
  Apple,
}

class Box<T> {
  constructor(public fruit: T) {}
}

const box: Box<Fruit> = new Box(Fruit.Apple);
void box;
    `,
    `
enum Fruit {
  Apple,
}

async function getFruit<T extends Fruit>(value: T): Promise<T> {
  return value;
}

void getFruit(Fruit.Apple);
    `,
    `
enum Fruit {
  Apple,
}

interface Basket<T> {
  fruit: T;
}

class BasketImpl<T extends Fruit> implements Basket<T> {
  fruit: T;

  constructor(fruit: T) {
    this.fruit = fruit;
  }
}

void new BasketImpl(Fruit.Apple);
    `,
    `
enum Fruit {
  Apple,
}

class Base<T> {
  fruit!: T;
}

class BasketImpl<T extends Fruit> extends Base<T> {
  fruit: T;

  constructor(fruit: T) {
    super();
    this.fruit = fruit;
  }
}

void new BasketImpl(Fruit.Apple);
    `,
    `
enum Fruit {
  Apple,
}

declare const foo: { [key in Fruit]: string };

function readValue<K extends Fruit>(key: K): string {
  return foo[key];
}

readValue(Fruit.Apple);
    `,
    `
enum Fruit {
  Apple,
}

function destructureArray<T extends [Fruit]>(value: T): T {
  const [fruit] = value;
  void fruit;
  return value;
}

destructureArray([Fruit.Apple]);
    `,
    `
enum Fruit {
  Apple,
}

const notFn = 1;
notFn(Fruit.Apple);

const notTag = 1;
notTag\`fruit\`;
    `,
    `
enum Fruit {
  Apple,
}

const box: { [key in Fruit]: number } = { [Fruit.Apple]: 1 };
void box;
    `,
    `
enum Fruit {
  Apple,
}

declare function takeBox(box: { fruit: Fruit }): void;

takeBox([Fruit.Apple]);

const value: {} = [Fruit.Apple];
void value;
    `,
    `
enum Fruit {
  Apple,
}

type BadThenable = {
  then(onfulfilled: string): unknown;
};

async function getFruit(): Promise<Fruit> {
  return {} as BadThenable;
}

void getFruit;
    `,
    `
enum Fruit {
  Apple,
}

type BadThenable = {
  then(onfulfilled: string): unknown;
};

async function getFruit(): BadThenable {
  return Promise.resolve(Fruit.Apple);
}

void getFruit;
    `,
    `
enum Fruit {
  Apple,
  Banana,
}

let foo: { [key in Fruit]: string } = {
  [Fruit.Apple]: 'apple',
  [Fruit.Banana]: 'banana',
};

foo[Math.random() > 0.5 ? Fruit.Apple : Fruit.Banana] = 'fruit';

const value = foo[Math.random() > 0.5 ? Fruit.Apple : Fruit.Banana];
void value;
    `,
    `
enum Fruit {
  Apple,
}

function destructureObject<T extends { fruit: Fruit }>(value: T): T {
  const { fruit } = value;
  void fruit;
  return value;
}

destructureObject({ fruit: Fruit.Apple });
    `,
    {
      code: `
enum Fruit {
  Apple,
}

declare function Basket<T extends { fruit: Fruit }>(props: T): JSX.Element;

<Basket fruit={Fruit.Apple} />;
      `,
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    {
      code: `
enum Fruit {
  Apple,
}

declare namespace JSX {
  interface IntrinsicElements {
    div: {};
  }
}

<div fruit={Fruit.Apple} />;
      `,
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
  ],
  invalid: [
    {
      code: `
enum Fruit {
  Apple,
}

let fruit: Fruit = Fruit.Apple;
fruit++;
      `,
      errors: [
        {
          column: 1,
          data: { enumNames: "'Fruit'" },
          endColumn: 8,
          line: 7,
          messageId: 'unsafeEnumMutation',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

let fruit: Fruit = Fruit.Apple;
--fruit;
      `,
      errors: [
        {
          column: 1,
          data: { enumNames: "'Fruit'" },
          endColumn: 8,
          line: 7,
          messageId: 'unsafeEnumMutation',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

let fruit: Fruit = Fruit.Apple;
fruit += 1;
      `,
      errors: [
        {
          column: 1,
          data: { enumNames: "'Fruit'" },
          endColumn: 11,
          line: 7,
          messageId: 'unsafeEnumMutation',
        },
      ],
    },
    {
      code: `
enum Flags {
  Read = 1 << 0,
  Write = 1 << 1,
}

let flags: Flags = Flags.Read;
flags <<= 1;
      `,
      errors: [
        {
          column: 1,
          data: { enumNames: "'Flags'" },
          endColumn: 12,
          line: 8,
          messageId: 'unsafeEnumMutation',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

declare const basket: { fruit: Fruit };
basket.fruit++;
      `,
      errors: [
        {
          column: 1,
          data: { enumNames: "'Fruit'" },
          endColumn: 15,
          line: 7,
          messageId: 'unsafeEnumMutation',
        },
      ],
    },
    {
      code: `
enum Flags {
  Read = 1 << 0,
  Write = 1 << 1,
}

declare const someNumber: number;

let flags: Flags = Flags.Read;
flags |= someNumber;
      `,
      errors: [
        {
          column: 1,
          data: { enumNames: "'Flags'" },
          endColumn: 20,
          line: 10,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

let fruit: Fruit | undefined;
fruit ??= 1;
      `,
      errors: [
        {
          column: 1,
          data: { enumNames: "'Fruit'" },
          endColumn: 12,
          line: 7,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

declare function takes(...args: [Fruit, Fruit]): void;
declare const spread: [Fruit, ...Fruit[]];
takes(...spread, 1);
      `,
      errors: [
        {
          column: 18,
          data: { enumNames: "'Fruit'" },
          endColumn: 19,
          line: 8,
          messageId: 'unsafeEnumArgument',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

declare function takes(...args: [Fruit, ...Fruit[]]): void;

takes(Fruit.Apple, Fruit.Apple, 1);
      `,
      errors: [
        {
          column: 33,
          data: { enumNames: "'Fruit'" },
          endColumn: 34,
          line: 8,
          messageId: 'unsafeEnumArgument',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

const fruit: Fruit = 1;
      `,
      errors: [
        {
          column: 7,
          data: { enumNames: "'Fruit'" },
          endColumn: 23,
          line: 6,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

let fruit = Fruit.Apple;
fruit = 1;
      `,
      errors: [
        {
          column: 1,
          data: { enumNames: "'Fruit'" },
          endColumn: 10,
          line: 7,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function takesFruit(fruit: Fruit = 1) {}
      `,
      errors: [
        {
          column: 21,
          data: { enumNames: "'Fruit'" },
          endColumn: 37,
          line: 6,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

class Basket {
  fruit: Fruit = 1;
}
      `,
      errors: [
        {
          column: 3,
          data: { enumNames: "'Fruit'" },
          endColumn: 20,
          line: 7,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

interface Basket {
  fruit: Fruit;
}

class TestBasket implements Basket {
  fruit = 1;
}
      `,
      errors: [
        {
          column: 3,
          data: { enumNames: "'Fruit'" },
          endColumn: 13,
          line: 11,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

const box: { fruit: Fruit } = { fruit: 1 };
      `,
      errors: [
        {
          column: 33,
          data: { enumNames: "'Fruit'" },
          endColumn: 41,
          line: 6,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function takesFruit(fruit: Fruit): void {}

takesFruit(1);
      `,
      errors: [
        {
          column: 12,
          data: { enumNames: "'Fruit'" },
          endColumn: 13,
          line: 8,
          messageId: 'unsafeEnumArgument',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

declare const maybeFruit: Fruit | number;

const fruit: Fruit = maybeFruit;
      `,
      errors: [
        {
          column: 7,
          data: { enumNames: "'Fruit'" },
          endColumn: 32,
          line: 8,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function getFruit(): Fruit {
  return 1;
}
      `,
      errors: [
        {
          column: 3,
          data: { enumNames: "'Fruit'" },
          endColumn: 12,
          line: 7,
          messageId: 'unsafeEnumReturn',
        },
      ],
    },
    {
      code: `
enum Vegetable {
  Asparagus = 'asparagus',
}

const getVegetable = (): Vegetable => 'asparagus';
      `,
      errors: [
        {
          column: 39,
          data: { enumNames: "'Vegetable'" },
          endColumn: 50,
          line: 6,
          messageId: 'unsafeEnumReturn',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

const fruit = 1 as Fruit;
      `,
      errors: [
        {
          column: 15,
          data: { enumNames: "'Fruit'" },
          endColumn: 25,
          line: 6,
          messageId: 'unsafeEnumAssertion',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

const fruit = <Fruit>1;
      `,
      errors: [
        {
          column: 15,
          data: { enumNames: "'Fruit'" },
          endColumn: 23,
          line: 6,
          messageId: 'unsafeEnumAssertion',
        },
      ],
    },
    {
      code: `
enum Vegetable {
  Asparagus = 'asparagus',
}

const vegetable: Vegetable = 'asparagus';
      `,
      errors: [
        {
          column: 7,
          data: { enumNames: "'Vegetable'" },
          endColumn: 41,
          line: 6,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function takesFruit(...fruit: [Fruit]): void {}

takesFruit(...([1] as const));
      `,
      errors: [
        {
          column: 12,
          data: { enumNames: "'Fruit'" },
          endColumn: 29,
          line: 8,
          messageId: 'unsafeEnumArgument',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function takesFruit(fruit: Fruit): void {}

takesFruit(...[1]);
      `,
      errors: [
        {
          column: 12,
          data: { enumNames: "'Fruit'" },
          endColumn: 18,
          line: 8,
          messageId: 'unsafeEnumArgument',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
  Banana,
}

function takesFruits(first: Fruit, second: Fruit): void {}

takesFruits(...[Fruit.Apple, 1]);
      `,
      errors: [
        {
          column: 13,
          data: { enumNames: "'Fruit'" },
          endColumn: 32,
          line: 9,
          messageId: 'unsafeEnumArgument',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
  Banana,
}

const fruits: Fruit[] = [1, 2];
      `,
      errors: [
        {
          column: 26,
          data: { enumNames: "'Fruit'" },
          endColumn: 27,
          line: 7,
          messageId: 'unsafeEnumAssignment',
        },
        {
          column: 29,
          data: { enumNames: "'Fruit'" },
          endColumn: 30,
          line: 7,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function takesFruits(fruits: Fruit[]): void {}

takesFruits([1]);
      `,
      errors: [
        {
          column: 14,
          data: { enumNames: "'Fruit'" },
          endColumn: 15,
          line: 8,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

const basket: { fruit: Fruit } = { fruit: Fruit.Apple };

basket.fruit = 1;
      `,
      errors: [
        {
          column: 1,
          data: { enumNames: "'Fruit'" },
          endColumn: 17,
          line: 8,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Vegetable {
  Asparagus = 'asparagus',
}

declare function Basket(props: { vegetable: Vegetable }): JSX.Element;

<Basket vegetable={'asparagus'} />;
      `,
      errors: [
        {
          column: 20,
          data: { enumNames: "'Vegetable'" },
          endColumn: 31,
          line: 8,
          messageId: 'unsafeEnumAssignment',
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    {
      code: `
enum Fruit {
  Apple,
}

declare const foo: { [key in Fruit]: string };

foo[0];
      `,
      errors: [
        {
          column: 5,
          data: { enumNames: "'Fruit'" },
          endColumn: 6,
          line: 8,
          messageId: 'unsafeEnumAccess',
        },
      ],
    },
    {
      code: `
enum Vegetable {
  Asparagus = 'asparagus',
}

declare const foo: { [key in Vegetable]: string };

foo?.['asparagus'];
      `,
      errors: [
        {
          column: 7,
          data: { enumNames: "'Vegetable'" },
          endColumn: 18,
          line: 8,
          messageId: 'unsafeEnumAccess',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

declare const bar: { [Fruit.Apple]: string };

bar[0];
      `,
      errors: [
        {
          column: 5,
          data: { enumNames: "'Fruit'" },
          endColumn: 6,
          line: 8,
          messageId: 'unsafeEnumAccess',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

declare const bar: { [Fruit.Apple]: string };

bar?.[0];
      `,
      errors: [
        {
          column: 7,
          data: { enumNames: "'Fruit'" },
          endColumn: 8,
          line: 8,
          messageId: 'unsafeEnumAccess',
        },
      ],
    },
    {
      code: `
const enum Direction {
  Up,
  Down,
}

const dir: Direction = 0;
      `,
      errors: [
        {
          column: 7,
          data: { enumNames: "'Direction'" },
          endColumn: 25,
          line: 7,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

enum Vegetable {
  Asparagus,
}

const fruit: Fruit = Vegetable.Asparagus;
      `,
      errors: [
        {
          column: 7,
          data: { enumNames: "'Fruit'" },
          endColumn: 41,
          line: 10,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

async function getFruit(): Promise<Fruit> {
  return 1;
}
      `,
      errors: [
        {
          column: 3,
          data: { enumNames: "'Fruit'" },
          endColumn: 12,
          line: 7,
          messageId: 'unsafeEnumReturn',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

declare function tag(strings: TemplateStringsArray, fruit: Fruit): string;

tag\`\${1}\`;
      `,
      errors: [
        {
          column: 7,
          data: { enumNames: "'Fruit'" },
          endColumn: 8,
          line: 8,
          messageId: 'unsafeEnumArgument',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

class Basket {
  constructor(public fruit: Fruit) {}
}

new Basket(1);
      `,
      errors: [
        {
          column: 12,
          data: { enumNames: "'Fruit'" },
          endColumn: 13,
          line: 10,
          messageId: 'unsafeEnumArgument',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

declare const num: number;

const fruit: Fruit = num;
      `,
      errors: [
        {
          column: 7,
          data: { enumNames: "'Fruit'" },
          endColumn: 25,
          line: 8,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

const fruit: Fruit = NaN;
      `,
      errors: [
        {
          column: 7,
          data: { enumNames: "'Fruit'" },
          endColumn: 25,
          line: 6,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

const fruit: Fruit = Number.MAX_SAFE_INTEGER;
      `,
      errors: [
        {
          column: 7,
          data: { enumNames: "'Fruit'" },
          endColumn: 45,
          line: 6,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

const a: Fruit = 1,
  b: Fruit = Fruit.Apple;
      `,
      errors: [
        {
          column: 7,
          data: { enumNames: "'Fruit'" },
          endColumn: 19,
          line: 6,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

const a: Fruit = 1,
  b: Fruit = 2;
      `,
      errors: [
        {
          column: 7,
          data: { enumNames: "'Fruit'" },
          endColumn: 19,
          line: 6,
          messageId: 'unsafeEnumAssignment',
        },
        {
          column: 3,
          data: { enumNames: "'Fruit'" },
          endColumn: 15,
          line: 7,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

class Basket {
  constructor(private fruit: Fruit = 1) {}
}
      `,
      errors: [
        {
          column: 23,
          data: { enumNames: "'Fruit'" },
          endColumn: 39,
          line: 7,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

declare const fruit: number;

const box: { fruit: Fruit } = { fruit };
      `,
      errors: [
        {
          column: 33,
          data: { enumNames: "'Fruit'" },
          endColumn: 38,
          line: 8,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

const [fruit]: [Fruit] = [1];
      `,
      errors: [
        {
          column: 8,
          data: { enumNames: "'Fruit'" },
          endColumn: 13,
          line: 6,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

const { fruit = 1 }: { fruit?: Fruit } = {};
void fruit;
      `,
      errors: [
        {
          column: 9,
          data: { enumNames: "'Fruit'" },
          endColumn: 18,
          line: 6,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function takesBasket({ fruit = 1 }: { fruit?: Fruit }): void {
  void fruit;
}
      `,
      errors: [
        {
          column: 24,
          data: { enumNames: "'Fruit'" },
          endColumn: 33,
          line: 6,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function takesFruit([fruit]: [Fruit] = [1]): void {}
      `,
      errors: [
        {
          column: 22,
          data: { enumNames: "'Fruit'" },
          endColumn: 27,
          line: 6,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

const { fruit }: { fruit: Fruit } = { fruit: 1 };
      `,
      errors: [
        {
          column: 9,
          data: { enumNames: "'Fruit'" },
          endColumn: 14,
          line: 6,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

const { fruit: picked }: { fruit: Fruit } = { fruit: 1 };
      `,
      errors: [
        {
          column: 16,
          data: { enumNames: "'Fruit'" },
          endColumn: 22,
          line: 6,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function takesBox({ fruit }: { fruit: Fruit } = { fruit: 1 }): void {}
      `,
      errors: [
        {
          column: 21,
          data: { enumNames: "'Fruit'" },
          endColumn: 26,
          line: 6,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

const fruits: Set<Fruit> = new Set([1, 2]);
      `,
      errors: [
        {
          column: 7,
          data: { enumNames: "'Fruit'" },
          endColumn: 43,
          line: 6,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

declare const cond: boolean;

const fruit: Fruit = cond ? 1 : Fruit.Apple;
      `,
      errors: [
        {
          column: 7,
          data: { enumNames: "'Fruit'" },
          endColumn: 44,
          line: 8,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

class Basket {
  accessor fruit: Fruit = 1;
}
      `,
      errors: [
        {
          column: 3,
          data: { enumNames: "'Fruit'" },
          endColumn: 29,
          line: 7,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function takesFruit<T extends Fruit>(fruit: T): void {}

takesFruit(1);
      `,
      errors: [
        {
          column: 12,
          data: { enumNames: "'Fruit'" },
          endColumn: 13,
          line: 8,
          messageId: 'unsafeEnumArgument',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

const x = [1, Fruit.Apple, 2] as const;
const y: readonly Fruit[] = x;
      `,
      errors: [
        {
          column: 7,
          data: { enumNames: "'Fruit'" },
          endColumn: 30,
          line: 7,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Flags {
  Read = 1 << 0,
  Write = 1 << 1,
}

const combined: Flags = 1 | 2;
      `,
      errors: [
        {
          column: 7,
          data: { enumNames: "'Flags'" },
          endColumn: 30,
          line: 7,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function takesRest(first: Fruit, ...rest: Fruit[]): void {}

takesRest(Fruit.Apple, 1);
      `,
      errors: [
        {
          column: 24,
          data: { enumNames: "'Fruit'" },
          endColumn: 25,
          line: 8,
          messageId: 'unsafeEnumArgument',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function takesRest(first: Fruit, ...rest: Fruit[]): void {}

takesRest(Fruit.Apple, ...[1]);
      `,
      errors: [
        {
          column: 24,
          data: { enumNames: "'Fruit'" },
          endColumn: 30,
          line: 8,
          messageId: 'unsafeEnumArgument',
        },
      ],
    },
    {
      code: `
enum Flags {
  Read = 1 << 0,
  Write = 1 << 1,
}

const combined: Flags = Flags.Read + Flags.Write;
      `,
      errors: [
        {
          column: 7,
          data: { enumNames: "'Flags'" },
          endColumn: 49,
          line: 7,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function takesFruit(fruit: Fruit): void {}
const numbers: number[] = [1, 2, 3];

takesFruit(...[1, ...numbers]);
      `,
      errors: [
        {
          column: 12,
          data: { enumNames: "'Fruit'" },
          endColumn: 30,
          line: 9,
          messageId: 'unsafeEnumArgument',
        },
      ],
    },
    {
      code: `
enum Flags {
  Read = 1 << 0,
  Write = 1 << 1,
}

const combined: Flags = Flags.Read | (Flags.Write + Flags.Read);
      `,
      errors: [
        {
          column: 7,
          data: { enumNames: "'Flags'" },
          endColumn: 64,
          line: 7,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function takesFruits(...fruits: Fruit[]): void {}
const numbers: number[] = [1, 2, 3];

takesFruits(...[1, ...numbers]);
      `,
      errors: [
        {
          column: 13,
          data: { enumNames: "'Fruit'" },
          endColumn: 31,
          line: 9,
          messageId: 'unsafeEnumArgument',
        },
        {
          column: 13,
          data: { enumNames: "'Fruit'" },
          endColumn: 31,
          line: 9,
          messageId: 'unsafeEnumArgument',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

interface Basket {
  fruit: Fruit;
}

class TestBasket implements Basket {
  accessor fruit = 1;
}
      `,
      errors: [
        {
          column: 3,
          data: { enumNames: "'Fruit'" },
          endColumn: 22,
          line: 11,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function assignFruit<T extends Fruit>(): void {
  const fruit: T = 1;
  void fruit;
}
      `,
      errors: [
        {
          column: 9,
          data: { enumNames: "'Fruit'" },
          endColumn: 21,
          line: 7,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function getFruit<T extends Fruit>(): T {
  return 1;
}
      `,
      errors: [
        {
          column: 3,
          data: { enumNames: "'Fruit'" },
          endColumn: 12,
          line: 7,
          messageId: 'unsafeEnumReturn',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function castFruit<T extends Fruit>(): T {
  return 1 as T;
}
      `,
      errors: [
        {
          column: 10,
          data: { enumNames: "'Fruit'" },
          endColumn: 16,
          line: 7,
          messageId: 'unsafeEnumAssertion',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

class Box<T extends Fruit> {
  constructor(public fruit: T) {}
}

new Box(1);
      `,
      errors: [
        {
          column: 9,
          data: { enumNames: "'Fruit'" },
          endColumn: 10,
          line: 10,
          messageId: 'unsafeEnumArgument',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

declare function Basket<T extends Fruit>(props: { fruit: T }): JSX.Element;

<Basket fruit={1} />;
      `,
      errors: [
        {
          column: 16,
          data: { enumNames: "'Fruit'" },
          endColumn: 17,
          line: 8,
          messageId: 'unsafeEnumAssignment',
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    {
      code: `
enum Vegetable {
  Asparagus = 'asparagus',
}

function assignVegetable<T extends Vegetable>(): void {
  const vegetable: T = 'asparagus';
  void vegetable;
}
      `,
      errors: [
        {
          column: 9,
          data: { enumNames: "'Vegetable'" },
          endColumn: 35,
          line: 7,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
const enum Direction {
  Up,
  Down,
}

function assignDirection<T extends Direction>(): void {
  const direction: T = 0;
  void direction;
}
      `,
      errors: [
        {
          column: 9,
          data: { enumNames: "'Direction'" },
          endColumn: 25,
          line: 8,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Mixed {
  A = 'a',
  B = 1,
}

function assignMixed<T extends Mixed>(): void {
  const mixed: T = 'a';
  void mixed;
}
      `,
      errors: [
        {
          column: 9,
          data: { enumNames: "'Mixed'" },
          endColumn: 23,
          line: 8,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function assignFruit<T extends Fruit, V extends T>(): V {
  return 1;
}
      `,
      errors: [
        {
          column: 3,
          data: { enumNames: "'Fruit'" },
          endColumn: 12,
          line: 7,
          messageId: 'unsafeEnumReturn',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function takesBox<T extends { fruit: Fruit }>(box: T): void {}

takesBox({ fruit: 1 });
      `,
      errors: [
        {
          column: 10,
          data: { enumNames: "'Fruit'" },
          endColumn: 22,
          line: 8,
          messageId: 'unsafeEnumArgument',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function assignBox<T extends { fruit: Fruit }>(): void {
  const box: T = { fruit: 1 };
  void box;
}
      `,
      errors: [
        {
          column: 20,
          data: { enumNames: "'Fruit'" },
          endColumn: 28,
          line: 7,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function getBox<T extends { fruit: Fruit }>(): T {
  return { fruit: 1 };
}
      `,
      errors: [
        {
          column: 3,
          data: { enumNames: "'Fruit'" },
          endColumn: 23,
          line: 7,
          messageId: 'unsafeEnumReturn',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function castBox<T extends { fruit: Fruit }>(): T {
  return { fruit: 1 } as T;
}
      `,
      errors: [
        {
          column: 10,
          data: { enumNames: "'Fruit'" },
          endColumn: 27,
          line: 7,
          messageId: 'unsafeEnumAssertion',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

class Box<T extends { fruit: Fruit }> {
  constructor(public value: T) {}
}

new Box({ fruit: 1 });
      `,
      errors: [
        {
          column: 9,
          data: { enumNames: "'Fruit'" },
          endColumn: 21,
          line: 10,
          messageId: 'unsafeEnumArgument',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

declare function Basket<T extends { fruit: Fruit }>(props: T): JSX.Element;

<Basket fruit={1} />;
      `,
      errors: [
        {
          column: 16,
          data: { enumNames: "'Fruit'" },
          endColumn: 17,
          line: 8,
          messageId: 'unsafeEnumAssignment',
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    {
      code: `
enum Fruit {
  Apple,
}

function takesNestedBox<T extends { box: { fruit: Fruit } }>(box: T): void {}

takesNestedBox({ box: { fruit: 1 } });
      `,
      errors: [
        {
          column: 16,
          data: { enumNames: "'Fruit'" },
          endColumn: 37,
          line: 8,
          messageId: 'unsafeEnumArgument',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function takesArray<T extends Fruit[]>(value: T): void {}

takesArray([1]);
      `,
      errors: [
        {
          column: 12,
          data: { enumNames: "'Fruit'" },
          endColumn: 15,
          line: 8,
          messageId: 'unsafeEnumArgument',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function assignArray<T extends Fruit[]>(): void {
  const fruits: T = [1];
  void fruits;
}
      `,
      errors: [
        {
          column: 9,
          data: { enumNames: "'Fruit'" },
          endColumn: 24,
          line: 7,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function getArray<T extends Fruit[]>(): T {
  return [1];
}
      `,
      errors: [
        {
          column: 3,
          data: { enumNames: "'Fruit'" },
          endColumn: 14,
          line: 7,
          messageId: 'unsafeEnumReturn',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function castArray<T extends Fruit[]>(): T {
  return [1] as T;
}
      `,
      errors: [
        {
          column: 10,
          data: { enumNames: "'Fruit'" },
          endColumn: 18,
          line: 7,
          messageId: 'unsafeEnumAssertion',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function takesReadonlyArray<T extends readonly Fruit[]>(value: T): void {}

takesReadonlyArray([1] as const);
      `,
      errors: [
        {
          column: 20,
          data: { enumNames: "'Fruit'" },
          endColumn: 32,
          line: 8,
          messageId: 'unsafeEnumArgument',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function takesBoxes<T extends Array<{ fruit: Fruit }>>(boxes: T): void {}

takesBoxes([{ fruit: 1 }]);
      `,
      errors: [
        {
          column: 12,
          data: { enumNames: "'Fruit'" },
          endColumn: 26,
          line: 8,
          messageId: 'unsafeEnumArgument',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function assignBoxes<T extends readonly { fruit: Fruit }[]>(): void {
  const boxes: T = [{ fruit: 1 }] as const;
  void boxes;
}
      `,
      errors: [
        {
          column: 9,
          data: { enumNames: "'Fruit'" },
          endColumn: 43,
          line: 7,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
  Banana,
}

function assignReadonlyTuple<T extends readonly [Fruit, Fruit]>(): void {
  const value: T = [Fruit.Apple, 1] as const;
  void value;
}
      `,
      errors: [
        {
          column: 9,
          data: { enumNames: "'Fruit'" },
          endColumn: 45,
          line: 8,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

type Box<T> = { fruit: T };

function takesAliasBox<T extends Fruit>(box: Box<T>): void {}

takesAliasBox({ fruit: 1 });
      `,
      errors: [
        {
          column: 15,
          data: { enumNames: "'Fruit'" },
          endColumn: 27,
          line: 10,
          messageId: 'unsafeEnumArgument',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

interface Box<T> {
  fruit: T;
}

const box: Box<Fruit> = { fruit: 1 };
void box;
      `,
      errors: [
        {
          column: 27,
          data: { enumNames: "'Fruit'" },
          endColumn: 35,
          line: 10,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

class Box<T> {
  constructor(public fruit: T) {}
}

const box: Box<Fruit> = new Box(1);
void box;
      `,
      errors: [
        {
          column: 7,
          data: { enumNames: "'Fruit'" },
          endColumn: 35,
          line: 10,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

async function getBox<T extends { fruit: Fruit }>(): Promise<T> {
  return { fruit: 1 };
}
      `,
      errors: [
        {
          column: 3,
          data: { enumNames: "'Fruit'" },
          endColumn: 23,
          line: 7,
          messageId: 'unsafeEnumReturn',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

interface Basket<T> {
  fruit: T;
}

class BasketImpl implements Basket<Fruit> {
  fruit = 1;
}
      `,
      errors: [
        {
          column: 3,
          data: { enumNames: "'Fruit'" },
          endColumn: 13,
          line: 11,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

class Base<T> {
  fruit!: T;
}

class BasketImpl extends Base<Fruit> {
  fruit = 1;
}
      `,
      errors: [
        {
          column: 3,
          data: { enumNames: "'Fruit'" },
          endColumn: 13,
          line: 11,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

interface Basket<T> {
  fruit: T;
}

class BasketImpl<T extends Fruit> implements Basket<T> {
  fruit = 1;
}
      `,
      errors: [
        {
          column: 3,
          data: { enumNames: "'Fruit'" },
          endColumn: 13,
          line: 11,
          messageId: 'unsafeEnumAssignment',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

declare const foo: { [key in Fruit]: string };

function readValue<K extends number>(key: K): string {
  return foo[key];
}
      `,
      errors: [
        {
          column: 14,
          data: { enumNames: "'Fruit'" },
          endColumn: 17,
          line: 9,
          messageId: 'unsafeEnumAccess',
        },
      ],
    },
    {
      code: `
enum Fruit {
  Apple,
}

function readValue<K extends number>(
  foo: { [P in Fruit]: string },
  key: K,
): string {
  return foo[key];
}
      `,
      errors: [
        {
          column: 14,
          data: { enumNames: "'Fruit'" },
          endColumn: 17,
          line: 10,
          messageId: 'unsafeEnumAccess',
        },
      ],
    },
  ],
});
