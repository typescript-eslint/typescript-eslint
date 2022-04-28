import {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/utils/src/ts-eslint';
import rule, { MessageIds } from '../../src/rules/strict-enums';
import { getFixturesRootDir, RuleTester } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

const valid: ValidTestCase<unknown[]>[] = [];
const invalid: InvalidTestCase<MessageIds, unknown[]>[] = [];

/** A number enum. */
const fruitEnumDefinition = `
enum Fruit {
  Apple,
  Banana,
  Pear,
}
`;

/**
 * A string enum.
 *
 * String enums are only used for comparison tests, since the TypeScript
 * compiler does a good job of ensuring safety for variable assignment and usage
 * in functions.
 */
const vegetableEnumDefinition = `
enum Vegetable {
  Lettuce = 'lettuce',
  Carrot = 'carrot',
  Celery = 'celery',
}
`;

/** A different number enum. */
const fruit2EnumDefinition = `
enum Fruit2 {
  Apple2,
  Banana2,
  Pear2,
}
`;

/** A different string enum. */
const vegetable2EnumDefinition = `
enum Vegetable2 {
  Lettuce2 = 'lettuce2',
  Carrot2 = 'carrot2',
  Celery2 = 'celery2',
}
`;

/** A function that takes a number enum. */
const fruitFunctionDefinition =
  fruitEnumDefinition +
  `
function useFruit(fruit: Fruit) {}
`;

/** A function that takes a number enum literal. */
const fruitLiteralFunctionDefinition =
  fruitEnumDefinition +
  `
function useFruit(fruit: Fruit.Apple) {}
`;

/** A function that takes a number enum with a default argument. */
const fruitFunctionWithDefaultArgDefinition =
  fruitEnumDefinition +
  `
function useFruit(fruit = Fruit.Apple) {}
`;

/** A function that takes a number enum literal with a default argument. */
const fruitLiteralFunctionWithDefaultArgDefinition =
  fruitEnumDefinition +
  `
function useFruit(fruit: Fruit.Apple = Fruit.Apple) {}
`;

/** A function that takes a number enum with a union. */
const fruitFunctionWithUnionDefinition =
  fruitEnumDefinition +
  `
function useFruit(fruit: Fruit | null) {}
`;

/** A function that takes a number enum with a union and a default argument. */
const fruitFunctionWithUnionAndDefaultDefinition =
  fruitEnumDefinition +
  `
function useFruit(fruit: Fruit | null = Fruit.Apple) {}
`;

/** A function that takes a number enum literal with a union. */
const fruitLiteralFunctionWithUnionDefinition =
  fruitEnumDefinition +
  `
function useFruit(fruit: Fruit.Apple | null) {}
`;

/** A function that takes a number enum literal with a union and a default argument. */
const fruitLiteralFunctionWithUnionAndDefaultDefinition =
  fruitEnumDefinition +
  `
function useFruit(fruit: Fruit.Apple | null = Fruit.Apple) {}
`;

/** A function that takes a number enum literal with a union including two enum types. */
const fruitLiteralFunctionWithComplexUnionDefinition =
  fruitEnumDefinition +
  `
function useFruit(fruit: Fruit.Apple | Fruit.Banana | null) {}
`;

// -----------------
// DECLARATION TESTS
// -----------------

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
 * In development, this would trigger run-time errors in Jest due to the
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

// ----------------
// ASSIGNMENT TESTS
// ----------------

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
  name: 'Assignment to variables with a composition type that includes individual enum values',
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
  name: 'Assignment to a variable with a intersection enum type',
  code:
    fruitEnumDefinition +
    fruit2EnumDefinition +
    `
const foo: Fruit & Fruit2 = Fruit.Apple;
  `,
});

// ------------------
// INCREMENTING TESTS
// ------------------

valid.push({
  name: 'Incrementing a number (postfix)',
  code:
    fruitEnumDefinition +
    `
let fruit = 0;
fruit++;
  `,
});

invalid.push({
  name: 'Incrementing a number enum value (postfix)',
  code:
    fruitEnumDefinition +
    `
let fruit = Fruit.Apple;
fruit++;
  `,
  errors: [{ messageId: 'incorrectIncrement' }],
});

valid.push({
  name: 'Decrementing a number (postfix)',
  code:
    fruitEnumDefinition +
    `
let fruit = 1;
fruit--;
  `,
});

invalid.push({
  name: 'Decrementing a number enum value (postfix)',
  code:
    fruitEnumDefinition +
    `
let fruit = Fruit.Banana;
fruit--;
  `,
  errors: [{ messageId: 'incorrectIncrement' }],
});

valid.push({
  name: 'Incrementing a number (prefix)',
  code:
    fruitEnumDefinition +
    `
let fruit = 0;
++fruit;
  `,
});

invalid.push({
  name: 'Incrementing a number enum value (prefix)',
  code:
    fruitEnumDefinition +
    `
let fruit = Fruit.Apple;
++fruit;
  `,
  errors: [{ messageId: 'incorrectIncrement' }],
});

valid.push({
  name: 'Decrementing a number (prefix)',
  code:
    fruitEnumDefinition +
    `
let fruit = 1;
--fruit
  `,
});

invalid.push({
  name: 'Decrementing a number enum value (prefix)',
  code:
    fruitEnumDefinition +
    `
let fruit = Fruit.Banana;
--fruit;
  `,
  errors: [{ messageId: 'incorrectIncrement' }],
});

valid.push({
  name: 'Incrementing a number (assignment operator)',
  code:
    fruitEnumDefinition +
    `
let fruit = 0;
fruit += 1;
  `,
});

invalid.push({
  name: 'Incrementing a number enum value (assignment operator)',
  code:
    fruitEnumDefinition +
    `
let fruit = Fruit.Apple;
fruit += 1;
  `,
  errors: [{ messageId: 'mismatchedAssignment' }],
});

valid.push({
  name: 'Decrementing a number (assignment operator)',
  code:
    fruitEnumDefinition +
    `
let fruit = 1;
fruit -= 1;
  `,
});

invalid.push({
  name: 'Decrementing a number enum value (assignment operator)',
  code:
    fruitEnumDefinition +
    `
let fruit = Fruit.Banana;
fruit -= 1;
  `,
  errors: [{ messageId: 'mismatchedAssignment' }],
});

// ----------------
// COMPARISON TESTS
// ----------------

valid.push({
  name: 'Comparing a number with a number',
  code:
    fruitEnumDefinition +
    `
if (1 === 2) {
}
  `,
});

valid.push({
  name: 'Comparing a number enum literal with an enum literal of the same type',
  code:
    fruitEnumDefinition +
    `
if (Fruit.Apple === Fruit.Banana) {
}
  `,
});

valid.push({
  name: 'Comparing a number enum value with an enum literal of the same type',
  code:
    fruitEnumDefinition +
    `
const fruit = Fruit.Apple;
if (fruit === Fruit.Banana) {
}
  `,
});

valid.push({
  name: 'Comparing a string enum value with an enum literal of the same type',
  code:
    vegetableEnumDefinition +
    `
const vegetable = Vegetable.Lettuce;
if (vegetable === Vegetable.Carrot) {
}
  `,
});

valid.push({
  name: 'Comparing a number enum value with a value of the same type',
  code:
    fruitEnumDefinition +
    `
const fruit1 = Fruit.Apple;
const fruit2 = Fruit.Banana;
if (fruit1 === fruit2) {
}
  `,
});

valid.push({
  name: 'Comparing a string enum value with a value of the same type',
  code:
    vegetableEnumDefinition +
    `
const vegetable1 = Vegetable.Lettuce;
const vegetable2 = Vegetable.Carrot;
if (vegetable1 === vegetable2) {
}
  `,
});

invalid.push({
  name: 'Comparing a number enum literal with a number literal',
  code:
    fruitEnumDefinition +
    `
if (Fruit.Apple === 1) {
}
  `,
  errors: [{ messageId: 'mismatchedComparison' }],
});

invalid.push({
  name: 'Comparing a string enum literal with a string literal',
  code:
    vegetableEnumDefinition +
    `
if (Vegetable.Lettuce === 'carrot') {
}
  `,
  errors: [{ messageId: 'mismatchedComparison' }],
});

invalid.push({
  name: 'Comparing a number literal with a number enum literal',
  code:
    fruitEnumDefinition +
    `
if (1 === Fruit.Apple) {
}
  `,
  errors: [{ messageId: 'mismatchedComparison' }],
});

invalid.push({
  name: 'Comparing a string literal with a string enum literal',
  code:
    vegetableEnumDefinition +
    `
if ('carrot' === Vegetable.Lettuce) {
}
  `,
  errors: [{ messageId: 'mismatchedComparison' }],
});

invalid.push({
  name: 'Comparing a number enum value with a number literal',
  code:
    fruitEnumDefinition +
    `
const fruit = Fruit.Apple;
if (fruit === 1) {
}
  `,
  errors: [{ messageId: 'mismatchedComparison' }],
});

invalid.push({
  name: 'Comparing a string enum value with a string literal',
  code:
    vegetableEnumDefinition +
    `
const vegetable = Vegetable.Lettuce;
if (vegetable === 'carrot') {
}
  `,
  errors: [{ messageId: 'mismatchedComparison' }],
});

invalid.push({
  name: 'Comparing a number literal with an enum value',
  code:
    fruitEnumDefinition +
    `
const fruit = Fruit.Apple;
if (1 === fruit) {
}
  `,
  errors: [{ messageId: 'mismatchedComparison' }],
});

invalid.push({
  name: 'Comparing a string literal with an enum value',
  code:
    vegetableEnumDefinition +
    `
const vegetable = Vegetable.Lettuce;
if ('carrot' === vegetable) {
}
  `,
  errors: [{ messageId: 'mismatchedComparison' }],
});

invalid.push({
  name: 'Comparing a number enum literal with a different enum literal',
  code:
    fruitEnumDefinition +
    fruit2EnumDefinition +
    `
if (Fruit.Apple === Fruit2.Apple2) {
}
  `,
  errors: [{ messageId: 'mismatchedComparison' }],
});

invalid.push({
  name: 'Comparing a string enum literal with a different enum literal',
  code:
    vegetableEnumDefinition +
    vegetable2EnumDefinition +
    `
if (Vegetable.Lettuce === Vegetable2.Lettuce2) {
}
  `,
  errors: [{ messageId: 'mismatchedComparison' }],
});

invalid.push({
  name: 'Comparing a number enum value with a different enum literal',
  code:
    fruitEnumDefinition +
    fruit2EnumDefinition +
    `
const fruit = Fruit.Apple;
if (fruit === Fruit2.Apple2) {
}
  `,
  errors: [{ messageId: 'mismatchedComparison' }],
});

invalid.push({
  name: 'Comparing a string enum value with a different enum literal',
  code:
    vegetableEnumDefinition +
    vegetable2EnumDefinition +
    `
const vegetable = Vegetable.Lettuce;
if (vegetable === Vegetable2.Lettuce2) {
}
  `,
  errors: [{ messageId: 'mismatchedComparison' }],
});

valid.push({
  name: 'Comparing a number enum literal value to an enum literal value of the same type (with strict inequality)',
  code:
    fruitEnumDefinition +
    `
if (Fruit.Apple !== Fruit.Banana) {
}
  `,
});

valid.push({
  name: 'Comparing a string enum literal value to an enum literal value of the same type (with strict inequality)',
  code:
    vegetableEnumDefinition +
    `
if (Vegetable.Lettuce !== Vegetable.Carrot) {
}
  `,
});

invalid.push({
  name: 'Comparing a number enum literal value to an enum literal value of the same type (with loose equality)',
  code:
    fruitEnumDefinition +
    `
if (Fruit.Apple == Fruit.Banana) {
}
  `,
  errors: [{ messageId: 'incorrectComparisonOperator' }],
});

invalid.push({
  name: 'Comparing a string enum literal value to an enum literal value of the same type (with loose equality)',
  code:
    vegetableEnumDefinition +
    `
if (Vegetable.Lettuce == Vegetable.Carrot) {
}
  `,
  errors: [{ messageId: 'incorrectComparisonOperator' }],
});

invalid.push({
  name: 'Comparing a number enum literal value to an enum literal value of the same type (with loose inequality)',
  code:
    fruitEnumDefinition +
    `
if (Fruit.Apple != Fruit.Banana) {
}
  `,
  errors: [{ messageId: 'incorrectComparisonOperator' }],
});

invalid.push({
  name: 'Comparing a string enum literal value to an enum literal value of the same type (with loose inequality)',
  code:
    vegetableEnumDefinition +
    `
if (Vegetable.Lettuce != Vegetable.Carrot) {
}
  `,
  errors: [{ messageId: 'incorrectComparisonOperator' }],
});

invalid.push({
  name: 'Comparing a number enum literal value to an enum literal value of the same type (with greater than)',
  code:
    fruitEnumDefinition +
    `
if (Fruit.Apple > Fruit.Banana) {
}
  `,
  errors: [{ messageId: 'incorrectComparisonOperator' }],
});

invalid.push({
  name: 'Comparing a number enum literal value to an enum literal value of the same type (with less than)',
  code:
    fruitEnumDefinition +
    `
if (Fruit.Apple < Fruit.Banana) {
}
  `,
  errors: [{ messageId: 'incorrectComparisonOperator' }],
});

// --------------
// FUNCTION TESTS
// --------------

valid.push({
  name: 'Using a normal function without any enums',
  code: `
function useNumber(num: number) {}
useNumber(0);
  `,
});

valid.push({
  name: 'Using a number enum literal as a function argument',
  code:
    fruitFunctionDefinition +
    `
useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value as a function argument',
  code:
    fruitFunctionDefinition +
    `
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

invalid.push({
  name: 'Using a number literal as a function argument',
  code:
    fruitFunctionDefinition +
    `
    useFruit(0);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using a number enum literal as a function argument (with an "enum literal" argument type)',
  code:
    fruitLiteralFunctionDefinition +
    `
    useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value as a function argument (with an "enum literal" argument type)',
  code:
    fruitLiteralFunctionDefinition +
    `
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

invalid.push({
  name: 'Using a number literal as a function argument (with an "enum literal" argument type)',
  code:
    fruitLiteralFunctionDefinition +
    `
useFruit(0);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using a number enum literal as a function argument (with a default function argument)',
  code:
    fruitFunctionWithDefaultArgDefinition +
    `
useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value as a function argument (with a default function argument)',
  code:
    fruitFunctionWithDefaultArgDefinition +
    `
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

invalid.push({
  name: 'Using a number literal as a function argument (with a default function argument)',
  code:
    fruitFunctionWithDefaultArgDefinition +
    `
useFruit(0);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using a number enum literal as a function argument (with a "number literal" arument type + default)',
  code:
    fruitLiteralFunctionWithDefaultArgDefinition +
    `
useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value as a function argument (with a "number literal" arument type + default)',
  code:
    fruitLiteralFunctionWithDefaultArgDefinition +
    `
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

invalid.push({
  name: 'Using a number literal as a function argument (with a "number literal" arument type + default)',
  code:
    fruitLiteralFunctionWithDefaultArgDefinition +
    `
useFruit(0);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using a number enum literal as a function argument (with a "number enum | null" argument type)',
  code:
    fruitFunctionWithUnionDefinition +
    `
useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value as a function argument (with a "number enum | null" argument type)',
  code:
    fruitFunctionWithUnionDefinition +
    `
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

valid.push({
  name: 'Using a null literal as a function argument (with a "number enum | null" argument type)',
  code:
    fruitFunctionWithUnionDefinition +
    `
useFruit(null);
  `,
});

valid.push({
  name: 'Using a null value as a function argument (with a "number enum | null" argument type)',
  code:
    fruitFunctionWithUnionDefinition +
    `
const fruit = null;
useFruit(fruit);
  `,
});

invalid.push({
  name: 'Using a number literal as a function argument (with a "number enum | null" function argument)',
  code:
    fruitFunctionWithUnionDefinition +
    `
useFruit(0);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using a number enum literal as a function argument (with a "number enum | null" argument type + default)',
  code:
    fruitFunctionWithUnionAndDefaultDefinition +
    `
useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value as a function argument (with a "number enum | null" argument type + default)',
  code:
    fruitFunctionWithUnionAndDefaultDefinition +
    `
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

valid.push({
  name: 'Using a null literal as a function argument (with a "number enum | null" argument type + default)',
  code:
    fruitFunctionWithUnionAndDefaultDefinition +
    `
useFruit(null);
  `,
});

valid.push({
  name: 'Using a null value as a function argument (with a "number enum | null" argument type + default)',
  code:
    fruitFunctionWithUnionAndDefaultDefinition +
    `
const fruit = null;
useFruit(fruit);
  `,
});

invalid.push({
  name: 'Using a number literal as a function argument (with a "number enum | null" function argument + default)',
  code:
    fruitFunctionWithUnionAndDefaultDefinition +
    `
useFruit(0);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using a number enum literal as a function argument (with a "number enum literal | null" argument type)',
  code:
    fruitLiteralFunctionWithUnionDefinition +
    `
useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value as a function argument (with a "number enum literal | null" argument type)',
  code:
    fruitLiteralFunctionWithUnionDefinition +
    `
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

valid.push({
  name: 'Using a null literal as a function argument (with a "number enum literal | null" argument type)',
  code:
    fruitLiteralFunctionWithUnionDefinition +
    `
useFruit(null);
  `,
});

valid.push({
  name: 'Using a null value as a function argument (with a "number enum literal | null" argument type)',
  code:
    fruitLiteralFunctionWithUnionDefinition +
    `
const fruit = null;
useFruit(fruit);
  `,
});

invalid.push({
  name: 'Using a number literal as a function argument (with a "number enum literal | null" function argument)',
  code:
    fruitLiteralFunctionWithUnionDefinition +
    `
useFruit(0);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using a number enum literal as a function argument (with a "number enum literal | null" argument type + default)',
  code:
    fruitLiteralFunctionWithUnionAndDefaultDefinition +
    `
useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value as a function argument (with a "number enum literal | null" argument type + default)',
  code:
    fruitLiteralFunctionWithUnionAndDefaultDefinition +
    `
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

valid.push({
  name: 'Using a null literal as a function argument (with a "number enum literal | null" argument type + default)',
  code:
    fruitLiteralFunctionWithUnionAndDefaultDefinition +
    `
useFruit(null);
  `,
});

valid.push({
  name: 'Using a null value as a function argument (with a "number enum literal | null" argument type + default)',
  code:
    fruitLiteralFunctionWithUnionAndDefaultDefinition +
    `
const fruit = null;
useFruit(fruit);
  `,
});

invalid.push({
  name: 'Using a number literal as a function argument (with a "number enum literal | null" function argument + default)',
  code:
    fruitLiteralFunctionWithUnionAndDefaultDefinition +
    `
useFruit(0);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using a number enum literal as a function argument (with a "number enum literal | number enum literal | null" argument type)',
  code:
    fruitLiteralFunctionWithComplexUnionDefinition +
    `
useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value as a function argument (with a "number enum literal | number enum literal | null" argument type)',
  code:
    fruitLiteralFunctionWithComplexUnionDefinition +
    `
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

valid.push({
  name: 'Using a null literal as a function argument (with a "number enum literal | number enum literal | null" argument type)',
  code:
    fruitLiteralFunctionWithComplexUnionDefinition +
    `
useFruit(null);
  `,
});

valid.push({
  name: 'Using a null value as a function argument (with a "number enum literal | number enum literal | null" argument type)',
  code:
    fruitLiteralFunctionWithComplexUnionDefinition +
    `
const fruit = null;
useFruit(fruit);
  `,
});

invalid.push({
  name: 'Using a number literal as a function argument (with a "number enum literal | number enum literal | null" argument type)',
  code:
    fruitLiteralFunctionWithComplexUnionDefinition +
    `
useFruit(0);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

// ---------
// END TESTS
// ---------

ruleTester.run('strict-enums', rule, {
  valid,
  invalid,
});
