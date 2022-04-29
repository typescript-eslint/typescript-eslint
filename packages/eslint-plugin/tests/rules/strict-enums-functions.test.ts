import {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/utils/src/ts-eslint';
import rule, { MessageIds } from '../../src/rules/strict-enums';
import { fruitEnumDefinition, strictEnumsRuleTester } from './strict-enums';

const valid: ValidTestCase<unknown[]>[] = [];
const invalid: InvalidTestCase<MessageIds, unknown[]>[] = [];

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
  name: 'Using a number enum literal as a function argument (with an "enum literal" parameter type)',
  code:
    fruitLiteralFunctionDefinition +
    `
useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value as a function argument (with an "enum literal" parameter type)',
  code:
    fruitLiteralFunctionDefinition +
    `
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

invalid.push({
  name: 'Using a number literal as a function argument (with an "enum literal" parameter type)',
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
  name: 'Using a number enum literal as a function argument (with a "number enum | null" parameter type)',
  code:
    fruitFunctionWithUnionDefinition +
    `
useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value as a function argument (with a "number enum | null" parameter type)',
  code:
    fruitFunctionWithUnionDefinition +
    `
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

valid.push({
  name: 'Using a null literal as a function argument (with a "number enum | null" parameter type)',
  code:
    fruitFunctionWithUnionDefinition +
    `
useFruit(null);
  `,
});

valid.push({
  name: 'Using a null value as a function argument (with a "number enum | null" parameter type)',
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
  name: 'Using a number enum literal as a function argument (with a "number enum | null" parameter type + default)',
  code:
    fruitFunctionWithUnionAndDefaultDefinition +
    `
useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value as a function argument (with a "number enum | null" parameter type + default)',
  code:
    fruitFunctionWithUnionAndDefaultDefinition +
    `
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

valid.push({
  name: 'Using a null literal as a function argument (with a "number enum | null" parameter type + default)',
  code:
    fruitFunctionWithUnionAndDefaultDefinition +
    `
useFruit(null);
  `,
});

valid.push({
  name: 'Using a null value as a function argument (with a "number enum | null" parameter type + default)',
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
  name: 'Using a number enum literal as a function argument (with a "number enum literal | null" parameter type)',
  code:
    fruitLiteralFunctionWithUnionDefinition +
    `
useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value as a function argument (with a "number enum literal | null" parameter type)',
  code:
    fruitLiteralFunctionWithUnionDefinition +
    `
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

valid.push({
  name: 'Using a null literal as a function argument (with a "number enum literal | null" parameter type)',
  code:
    fruitLiteralFunctionWithUnionDefinition +
    `
useFruit(null);
  `,
});

valid.push({
  name: 'Using a null value as a function argument (with a "number enum literal | null" parameter type)',
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
  name: 'Using a number enum literal as a function argument (with a "number enum literal | null" parameter type + default)',
  code:
    fruitLiteralFunctionWithUnionAndDefaultDefinition +
    `
useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value as a function argument (with a "number enum literal | null" parameter type + default)',
  code:
    fruitLiteralFunctionWithUnionAndDefaultDefinition +
    `
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

valid.push({
  name: 'Using a null literal as a function argument (with a "number enum literal | null" parameter type + default)',
  code:
    fruitLiteralFunctionWithUnionAndDefaultDefinition +
    `
useFruit(null);
  `,
});

valid.push({
  name: 'Using a null value as a function argument (with a "number enum literal | null" parameter type + default)',
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
  name: 'Using a number enum literal as a function argument (with a "number enum literal | number enum literal | null" parameter type)',
  code:
    fruitLiteralFunctionWithComplexUnionDefinition +
    `
useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value as a function argument (with a "number enum literal | number enum literal | null" parameter type)',
  code:
    fruitLiteralFunctionWithComplexUnionDefinition +
    `
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

valid.push({
  name: 'Using a null literal as a function argument (with a "number enum literal | number enum literal | null" parameter type)',
  code:
    fruitLiteralFunctionWithComplexUnionDefinition +
    `
useFruit(null);
  `,
});

valid.push({
  name: 'Using a null value as a function argument (with a "number enum literal | number enum literal | null" parameter type)',
  code:
    fruitLiteralFunctionWithComplexUnionDefinition +
    `
const fruit = null;
useFruit(fruit);
  `,
});

invalid.push({
  name: 'Using a number literal as a function argument (with a "number enum literal | number enum literal | null" parameter type)',
  code:
    fruitLiteralFunctionWithComplexUnionDefinition +
    `
useFruit(0);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using an enum from a composition type as a function argument',
  code:
    fruitFunctionDefinition +
    `
interface BaseNode {
  type: Fruit;
}

interface AppleNode extends BaseNode {
  type: Fruit.Apple;
  apple: number;
}

interface BananaNode extends BaseNode {
  type: Fruit.Apple;
  banana: Number;
}

type Node = AppleNode | BananaNode;

const fruitNodesSet = new Set([
  Fruit.Apple,
  Fruit.Banana,
]);

const appleNode: AppleNode = {
  type: Fruit.Apple,
  apple: 1,
};

fruitNodesSet.has(appleNode.type);
  `,
});

valid.push({
  name: 'Using a partial union type as a function argument',
  code:
    fruitFunctionDefinition +
    `
declare const fruitUnion: Fruit.Apple | Fruit.Banana;
useFruit(fruitUnion);
`,
});

valid.push({
  name: 'Using a full union type as a function argument',
  code:
    fruitFunctionDefinition +
    `
declare const fruitUnion: Fruit.Apple | Fruit.Banana | Fruit.Pear;
useFruit(fruitUnion);
`,
});

valid.push({
  name: 'Using a partial union type as a function argument (from a type narrowing switch statement)',
  code:
    fruitFunctionDefinition +
    `
function foo(fruit: Fruit) {
  switch (fruit) {
    case Fruit.Apple:
    case Fruit.Banana: {
      useFruit(fruit);
    }
  }
}
`,
});

valid.push({
  name: 'Using a number enum as a function argument with an enum extension type',
  code:
    fruitEnumDefinition +
    `
class FruitClass<FruitType extends Fruit> {
  constructor(type: FruitType) {
  }
}
const fruitClass = new FruitClass(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum array as a function argument with an number enum array type',
  code:
    fruitEnumDefinition +
    `
function useFruitArray(fruitArray: Fruit[]) {}
useFruitArray([Fruit.Apple, Fruit.Banana]);
  `,
});

valid.push({
  name: 'Using a number enum literal for a function with type parameter of number',
  code:
    fruitEnumDefinition +
    `
function useNumber(num: number) {}
useNumber(Fruit.Apple);
  `,
});

strictEnumsRuleTester.run('strict-enums-comparison', rule, {
  valid,
  invalid,
});
