import {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/utils/src/ts-eslint';
import rule, { MessageIds } from '../../src/rules/strict-enums';
import {
  fruit2EnumDefinition,
  fruitEnumDefinition,
  strictEnumsRuleTester,
  vegetable2EnumDefinition,
  vegetableEnumDefinition,
} from './strict-enums';

const valid: ValidTestCase<unknown[]>[] = [];
const invalid: InvalidTestCase<MessageIds, unknown[]>[] = [];

// ----------------------
// COMPARISON TYPES TESTS
// ----------------------

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
  name: 'Comparing a number enum literal to any',
  code:
    fruitEnumDefinition +
    `
declare thing: any;
if (Fruit.Apple === thing) {
}
  `,
});

valid.push({
  name: 'Comparing a number enum literal to literal undefined',
  code:
    fruitEnumDefinition +
    `
if (Fruit.Apple === undefined) {
}
  `,
});

valid.push({
  name: 'Comparing a number enum literal to literal null',
  code:
    fruitEnumDefinition +
    `
if (Fruit.Apple === null) {
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
  name: 'Comparing a generic enum extension value with a number enum literal',
  code:
    fruitEnumDefinition +
    `
class FruitClass<FruitType extends Fruit> {
  constructor(type: FruitType) {
    if (type === Fruit.Apple) {}
  }
}
  `,
});

valid.push({
  name: 'Comparing a number union to a number union',
  code:
    fruitEnumDefinition +
    fruit2EnumDefinition +
    `
declare const left: number | Fruit;
declare const right: number | Fruit2;
if (left === right) {}
    `,
});

valid.push({
  name: 'Comparing a string union to a string union',
  code:
    vegetableEnumDefinition +
    vegetable2EnumDefinition +
    `
declare const left: string | Vegetable;
declare const right: string | Vegetable2;
if (left === right) {}
    `,
});

// --------------
// OPERATOR TESTS
// --------------

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

valid.push({
  name: 'Comparing a number enum literal value to an enum literal value of the same type (with greater than)',
  code:
    fruitEnumDefinition +
    `
if (Fruit.Apple > Fruit.Banana) {
}
  `,
});

valid.push({
  name: 'Comparing a number enum literal value to an enum literal value of the same type (with less than)',
  code:
    fruitEnumDefinition +
    `
if (Fruit.Apple < Fruit.Banana) {
}
  `,
});

strictEnumsRuleTester.run('strict-enums-comparison', rule, {
  valid,
  invalid,
});
