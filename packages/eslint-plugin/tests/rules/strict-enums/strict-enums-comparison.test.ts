import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/utils/src/ts-eslint';

import type { MessageIds } from '../../../src/rules/strict-enums';
import rule from '../../../src/rules/strict-enums';
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
1 === 2;
  `,
});

valid.push({
  name: 'Comparing a number enum literal to any',
  code:
    fruitEnumDefinition +
    `
declare thing: any;
Fruit.Apple === thing;
  `,
});

valid.push({
  name: 'Comparing a number enum literal to literal undefined',
  code:
    fruitEnumDefinition +
    `
Fruit.Apple === undefined;
  `,
});

valid.push({
  name: 'Comparing a number enum literal to literal null',
  code:
    fruitEnumDefinition +
    `
Fruit.Apple === null;
  `,
});

valid.push({
  name: 'Comparing a number enum literal with an enum literal of the same type',
  code:
    fruitEnumDefinition +
    `
Fruit.Apple === Fruit.Banana;
  `,
});

valid.push({
  name: 'Comparing a number enum value with an enum literal of the same type',
  code:
    fruitEnumDefinition +
    `
const fruit = Fruit.Apple;
fruit === Fruit.Banana;
  `,
});

valid.push({
  name: 'Comparing a string enum value with an enum literal of the same type',
  code:
    vegetableEnumDefinition +
    `
const vegetable = Vegetable.Lettuce;
vegetable === Vegetable.Carrot;
  `,
});

valid.push({
  name: 'Comparing a number enum value with a value of the same type',
  code:
    fruitEnumDefinition +
    `
const fruit1 = Fruit.Apple;
const fruit2 = Fruit.Banana;
fruit1 === fruit2;
  `,
});

valid.push({
  name: 'Comparing a string enum value with a value of the same type',
  code:
    vegetableEnumDefinition +
    `
const vegetable1 = Vegetable.Lettuce;
const vegetable2 = Vegetable.Carrot;
vegetable1 === vegetable2;
  `,
});

invalid.push({
  name: 'Comparing a number enum literal with a number literal',
  code:
    fruitEnumDefinition +
    `
Fruit.Apple === 1;
  `,
  errors: [{ messageId: 'mismatchedComparison' }],
});

invalid.push({
  name: 'Comparing a string enum literal with a string literal',
  code:
    vegetableEnumDefinition +
    `
Vegetable.Lettuce === 'carrot';
  `,
  errors: [{ messageId: 'mismatchedComparison' }],
});

invalid.push({
  name: 'Comparing a number literal with a number enum literal',
  code:
    fruitEnumDefinition +
    `
1 === Fruit.Apple;
  `,
  errors: [{ messageId: 'mismatchedComparison' }],
});

invalid.push({
  name: 'Comparing a string literal with a string enum literal',
  code:
    vegetableEnumDefinition +
    `
'carrot' === Vegetable.Lettuce;
  `,
  errors: [{ messageId: 'mismatchedComparison' }],
});

invalid.push({
  name: 'Comparing a number enum value with a number literal',
  code:
    fruitEnumDefinition +
    `
const fruit = Fruit.Apple;
fruit === 1;
  `,
  errors: [{ messageId: 'mismatchedComparison' }],
});

invalid.push({
  name: 'Comparing a string enum value with a string literal',
  code:
    vegetableEnumDefinition +
    `
const vegetable = Vegetable.Lettuce;
vegetable === 'carrot';
  `,
  errors: [{ messageId: 'mismatchedComparison' }],
});

invalid.push({
  name: 'Comparing a number literal with an enum value',
  code:
    fruitEnumDefinition +
    `
const fruit = Fruit.Apple;
1 === fruit;
  `,
  errors: [{ messageId: 'mismatchedComparison' }],
});

invalid.push({
  name: 'Comparing a string literal with an enum value',
  code:
    vegetableEnumDefinition +
    `
const vegetable = Vegetable.Lettuce;
'carrot' === vegetable;
  `,
  errors: [{ messageId: 'mismatchedComparison' }],
});

invalid.push({
  name: 'Comparing a number enum literal with a different enum literal',
  code:
    fruitEnumDefinition +
    fruit2EnumDefinition +
    `
Fruit.Apple === Fruit2.Apple2;
  `,
  errors: [{ messageId: 'mismatchedComparison' }],
});

invalid.push({
  name: 'Comparing a string enum literal with a different enum literal',
  code:
    vegetableEnumDefinition +
    vegetable2EnumDefinition +
    `
Vegetable.Lettuce === Vegetable2.Lettuce2;
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
fruit === Fruit2.Apple2;
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
vegetable === Vegetable2.Lettuce2;
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
left === right;
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
left === right;
    `,
});

valid.push({
  name: 'Comparing a string enum literal to an intersection with a string (simple)',
  code:
    vegetableEnumDefinition +
    `
type WeirdString = string & { __someBrand: void; };
declare weirdString: WeirdString;
Vegetable.Lettuce === weirdString;
  `,
});

valid.push({
  name: 'Comparing a string literal to an intersection with a string (complicated)',
  code:
    vegetableEnumDefinition +
    `
enum InternalSymbolName {
  Foo = "foo",
  Bar = "bar",
}
type __String =
  | (string & { __escapedIdentifier: void; })
  | (void & { __escapedIdentifier: void; })
  | InternalSymbolName;
declare const weirdString: __String;
weirdString === 'someArbitraryValue';
  `,
});

valid.push({
  name: 'Comparing using the in operator',
  code:
    vegetableEnumDefinition +
    `
const foo = {};
const vegetable = Vegetable.Lettuce;
vegetable in foo;
  `,
});

valid.push({
  name: 'Comparing using a type of enum | boolean',
  code:
    fruitEnumDefinition +
    `
declare const fruitOrBoolean: Fruit | boolean;
fruitOrBoolean === true;
    `,
});

valid.push({
  name: "Comparing various valid types (Brad's test)",
  code: `
enum Str {
  A = 'a',
}
enum Num {
  B = 1,
}
enum Mixed {
  A = 'a',
  B = 1,
}

declare const str: Str;
declare const strOrString: Str | string;

declare const num: Num;
declare const numOrNumber: Num | number;

declare const mixed: Mixed;
declare const mixedOrStringOrNumber: Mixed | string | number;

function someFunction() {}

// following are all ignored due to the presence of "| string" or "| number"
strOrString === 'a';
numOrNumber === 1;
mixedOrStringOrNumber === 'a';
mixedOrStringOrNumber === 1;

// following are all ignored because the value can never be an enum value
str === 1;
/*
num === 'a';
str === {};
num === {};
mixed === {};
str === true;
num === true;
mixed === true;
str === someFunction;
num === someFunction;
mixed === someFunction;
*/
  `,
});

invalid.push({
  name: "Comparing various invalid types (Brad's test)",
  code: `
enum Str {
  A = 'a',
}
enum Num {
  B = 1,
}
enum Mixed {
  A = 'a',
  B = 1,
}

declare const str: Str;
declare const num: Num;
declare const mixed: Mixed;

// following are all errors because the value might be an enum value
str === 'a';
num === 1;
mixed === 'a';
mixed === 1;
  `,
  errors: [
    { messageId: 'mismatchedComparison' },
    { messageId: 'mismatchedComparison' },
    { messageId: 'mismatchedComparison' },
    { messageId: 'mismatchedComparison' },
  ],
});

strictEnumsRuleTester.run('strict-enums-comparison', rule, {
  valid,
  invalid,
});
