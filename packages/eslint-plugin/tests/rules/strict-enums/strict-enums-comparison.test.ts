import rule from '../../../src/rules/no-unsafe-enum-comparison';
import {
  fruit2EnumDefinition,
  fruitEnumDefinition,
  strictEnumsRuleTester,
  vegetable2EnumDefinition,
  vegetableEnumDefinition,
} from './shared';

strictEnumsRuleTester.run('strict-enums-comparison', rule, {
  valid: [
    {
      code:
        fruitEnumDefinition +
        `
    1 === 2;
      `,
    },
    {
      code:
        fruitEnumDefinition +
        `
    declare thing: any;
    Fruit.Apple === thing;
      `,
    },
    {
      code:
        fruitEnumDefinition +
        `
    Fruit.Apple === undefined;
      `,
    },
    {
      code:
        fruitEnumDefinition +
        `
    Fruit.Apple === null;
      `,
    },
    {
      code:
        fruitEnumDefinition +
        `
    Fruit.Apple === Fruit.Banana;
      `,
    },
    {
      code:
        fruitEnumDefinition +
        `
    const fruit = Fruit.Apple;
    fruit === Fruit.Banana;
      `,
    },
    {
      code:
        vegetableEnumDefinition +
        `
    const vegetable = Vegetable.Lettuce;
    vegetable === Vegetable.Carrot;
      `,
    },
    {
      code:
        fruitEnumDefinition +
        `
    const fruit1 = Fruit.Apple;
    const fruit2 = Fruit.Banana;
    fruit1 === fruit2;
      `,
    },
    {
      code:
        vegetableEnumDefinition +
        `
    const vegetable1 = Vegetable.Lettuce;
    const vegetable2 = Vegetable.Carrot;
    vegetable1 === vegetable2;
      `,
    },
    {
      code:
        fruitEnumDefinition +
        `
    class FruitClass<FruitType extends Fruit> {
      constructor(type: FruitType) {
        if (type === Fruit.Apple) {}
      }
    }
      `,
    },
    {
      code:
        fruitEnumDefinition +
        fruit2EnumDefinition +
        `
    declare const left: number | Fruit;
    declare const right: number | Fruit2;
    left === right;
        `,
    },
    {
      code:
        vegetableEnumDefinition +
        vegetable2EnumDefinition +
        `
    declare const left: string | Vegetable;
    declare const right: string | Vegetable2;
    left === right;
        `,
    },
    {
      code:
        vegetableEnumDefinition +
        `
    type WeirdString = string & { __someBrand: void; };
    declare weirdString: WeirdString;
    Vegetable.Lettuce === weirdString;
      `,
    },
    {
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
    },
    {
      code:
        vegetableEnumDefinition +
        `
    const foo = {};
    const vegetable = Vegetable.Lettuce;
    vegetable in foo;
      `,
    },
    {
      code:
        fruitEnumDefinition +
        `
    declare const fruitOrBoolean: Fruit | boolean;
    fruitOrBoolean === true;
        `,
    },
    {
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
      `,
    },
  ],
  invalid: [
    {
      code:
        fruitEnumDefinition +
        `
      Fruit.Apple === 1;
        `,
      errors: [{ messageId: 'mismatchedComparison' }],
    },
    {
      code:
        vegetableEnumDefinition +
        `
      Vegetable.Lettuce === 'carrot';
        `,
      errors: [{ messageId: 'mismatchedComparison' }],
    },
    {
      code:
        fruitEnumDefinition +
        `
      1 === Fruit.Apple;
        `,
      errors: [{ messageId: 'mismatchedComparison' }],
    },
    {
      code:
        vegetableEnumDefinition +
        `
      'carrot' === Vegetable.Lettuce;
        `,
      errors: [{ messageId: 'mismatchedComparison' }],
    },
    {
      code:
        fruitEnumDefinition +
        `
      const fruit = Fruit.Apple;
      fruit === 1;
        `,
      errors: [{ messageId: 'mismatchedComparison' }],
    },
    {
      code:
        vegetableEnumDefinition +
        `
      const vegetable = Vegetable.Lettuce;
      vegetable === 'carrot';
        `,
      errors: [{ messageId: 'mismatchedComparison' }],
    },
    {
      code:
        fruitEnumDefinition +
        `
      const fruit = Fruit.Apple;
      1 === fruit;
        `,
      errors: [{ messageId: 'mismatchedComparison' }],
    },
    {
      code:
        vegetableEnumDefinition +
        `
      const vegetable = Vegetable.Lettuce;
      'carrot' === vegetable;
        `,
      errors: [{ messageId: 'mismatchedComparison' }],
    },
    {
      code:
        fruitEnumDefinition +
        fruit2EnumDefinition +
        `
      Fruit.Apple === Fruit2.Apple2;
        `,
      errors: [{ messageId: 'mismatchedComparison' }],
    },
    {
      code:
        vegetableEnumDefinition +
        vegetable2EnumDefinition +
        `
      Vegetable.Lettuce === Vegetable2.Lettuce2;
        `,
      errors: [{ messageId: 'mismatchedComparison' }],
    },
    {
      code:
        fruitEnumDefinition +
        fruit2EnumDefinition +
        `
      const fruit = Fruit.Apple;
      fruit === Fruit2.Apple2;
        `,
      errors: [{ messageId: 'mismatchedComparison' }],
    },
    {
      code:
        vegetableEnumDefinition +
        vegetable2EnumDefinition +
        `
      const vegetable = Vegetable.Lettuce;
      vegetable === Vegetable2.Lettuce2;
        `,
      errors: [{ messageId: 'mismatchedComparison' }],
    },
    {
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
    },
  ],
});
