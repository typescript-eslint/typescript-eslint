import {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/utils/src/ts-eslint';
import rule, { MessageIds } from '../../../src/rules/strict-enums';
import {
  fruit2EnumDefinition,
  fruitEnumDefinition,
  strictEnumsRuleTester,
} from './strict-enums';

const valid: ValidTestCase<unknown[]>[] = [];
const invalid: InvalidTestCase<MessageIds, unknown[]>[] = [];

valid.push({
  name: 'Declaring an enum with an empty initializer',
  code:
    fruitEnumDefinition +
    `
  let fruit: Fruit;
  if (true) {
    fruit = Fruit.Apple;
  } else {
    fruit = Fruit.Banana;
  }
    `,
});

/**
 * In development, this would trigger run-time errors due to the
 * `typeChecker.getTypeAtLocation` method being buggy and not having a proper
 * function signature.
 */
valid.push({
  name: 'Declaring an "empty" variable with array destructuring',
  code: `
  const myArray = [1];
  const [firstElement] = myArray;
    `,
});

valid.push({
  name: 'Assigning a number enum literal to a number enum (with type-inference)',
  code:
    fruitEnumDefinition +
    `
const fruit = Fruit.Apple;
  `,
});

valid.push({
  name: 'Assigning a number enum literal to a number enum (without type-inference)',
  code:
    fruitEnumDefinition +
    `
const fruit: Fruit = Fruit.Apple;
  `,
});

valid.push({
  name: 'Assigning a number enum value to a variable of the same type with const',
  code:
    fruitEnumDefinition +
    `
const apple = Fruit.Apple;
const fruit: Fruit = apple;
  `,
});

invalid.push({
  name: 'Assigning a number literal to a number enum with const',
  code:
    fruitEnumDefinition +
    `
const fruit: Fruit = 0;
  `,
  errors: [{ messageId: 'mismatchedAssignment' }],
});

valid.push({
  name: 'Assigning a number enum value to a variable of the same type with let',
  code:
    fruitEnumDefinition +
    `
let fruit = Fruit.Apple;
fruit = Fruit.Banana;
  `,
});

invalid.push({
  name: 'Assigning a number literal to a number enum with let',
  code:
    fruitEnumDefinition +
    `
let fruit = Fruit.Apple;
fruit = 1;
  `,
  errors: [{ messageId: 'mismatchedAssignment' }],
});

invalid.push({
  name: 'Assigning an enum parent to a number enum',
  code:
    fruitEnumDefinition +
    `
const fruit: Fruit = Fruit;
  `,
  errors: [{ messageId: 'mismatchedAssignment' }],
});

invalid.push({
  name: 'Assigning a mismatched enum value to a number enum',
  code:
    fruitEnumDefinition +
    fruit2EnumDefinition +
    `
const fruit: Fruit = Fruit2.Apple2;
  `,
  errors: [{ messageId: 'mismatchedAssignment' }],
});

valid.push({
  name: 'Assigning a number enum literal to a variable with a union type of "number enum | null" with const',
  code:
    fruitEnumDefinition +
    `
const fruit: Fruit | null = Fruit.Apple;
  `,
});

valid.push({
  name: 'Assigning a null value to a variable with a union type of "number enum | null" with const',
  code:
    fruitEnumDefinition +
    `
const fruit: Fruit | null = null;
  `,
});

invalid.push({
  name: 'Assigning a number literal to a variable with a union type of "number enum | null" with const',
  code:
    fruitEnumDefinition +
    `
const fruit: Fruit | null = 0;
  `,
  errors: [{ messageId: 'mismatchedAssignment' }],
});

valid.push({
  name: 'Assigning a number enum literal to a variable with a union type of "number enum | null" with let',
  code:
    fruitEnumDefinition +
    `
let fruit: Fruit | null = null;
fruit = Fruit.Apple;
  `,
});

valid.push({
  name: 'Assigning a null value to a variable with a union type of "number enum | null" with let',
  code:
    fruitEnumDefinition +
    `
let fruit: Fruit | null = Fruit.Apple;
fruit = null;
  `,
});

invalid.push({
  name: 'Assigning a number literal to a variable with a union type of "number enum | null" with let',
  code:
    fruitEnumDefinition +
    `
let fruit: Fruit | null = null;
fruit = 0;
  `,
  errors: [{ messageId: 'mismatchedAssignment' }],
});

invalid.push({
  name: 'Assigning a enum literal to a variable with a union type of "number enum | number"',
  code:
    fruitEnumDefinition +
    `
declare const fruit: Fruit | number;
const fruitCopy: Fruit = fruit;
  `,
  errors: [{ messageId: 'mismatchedAssignment' }],
});

valid.push({
  name: 'Assigning variables with a composition type that includes individual enum values',
  code: `
enum Foo {
  A = 1,
  B = 2,
  C = 3,
  D = 4,
}

declare const foo: Foo;
declare const fooSubset: Foo.A | Foo.B | Foo.C;
const x: Foo = fooSubset;
const y: Foo.A | Foo.B | Foo.C = fooSubset;
const z: Foo.A | Foo.B | Foo.C | Foo.D = foo;
  `,
});

/**
 * Intersection enum types are not checked by this rule. Even though doing this
 * would almost certainly be a bad idea, a programmer would have to go to great
 * lengths to do this, so we assume that the programmer knows what they are
 * doing and allow it.
 */
valid.push({
  name: 'Assigning a variable with a intersection enum type',
  code:
    fruitEnumDefinition +
    fruit2EnumDefinition +
    `
const foo: Fruit & Fruit2 = Fruit.Apple;
  `,
});

valid.push({
  name: 'Assigning to a variable with a composition of binary flags',
  code: `
enum Flag {
  Value1 = 1 << 0,
  Value2 = 1 << 1,
}
const flags = Flag.Value1 | Flag.Value2;
  `,
});

valid.push({
  name: 'Assigning a number enum array to a variable with a number enum array',
  code:
    fruitEnumDefinition +
    `
declare let fruits: Fruit[];
fruits = [Fruit.Apple, Fruit.Banana];
  `,
});

valid.push({
  name: 'Assigning a number enum array to a variable with a number array',
  code:
    fruitEnumDefinition +
    `
declare let numbers: number[];
numbers = [Fruit.Apple, Fruit.Banana];
  `,
});

invalid.push({
  name: 'Assigning a number array to a variable with a number enum array',
  code:
    fruitEnumDefinition +
    `
declare let fruits: Fruit[];
fruits = [0, 1];
  `,
  errors: [{ messageId: 'mismatchedAssignment' }],
});

valid.push({
  name: 'Assigning an empty array to a variable with a number enum array',
  code:
    fruitEnumDefinition +
    `
const fruitArray: Fruit[] = [];
  `,
});

invalid.push({
  name: 'Assigning a mismatched number enum array',
  code:
    fruitEnumDefinition +
    fruit2EnumDefinition +
    `
declare let fruits: Fruit[];
fruits = [Fruit2.Apple2, Fruit2.Banana2];
  `,
  errors: [{ messageId: 'mismatchedAssignment' }],
});

valid.push({
  name: 'Assigning a new variable with a composition of bitflags',
  code:
    fruitEnumDefinition +
    `
const fruitFlags = Fruit.Apple | Fruit.Banana;
  `,
});

strictEnumsRuleTester.run('strict-enums-assignment', rule, {
  valid,
  invalid,
});
