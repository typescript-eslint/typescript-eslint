import {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/utils/src/ts-eslint';
import rule, { MessageIds } from '../../src/rules/strict-enums';
import {
  fruitEnumDefinition,
  strictEnumsRuleTester,
  vegetableEnumDefinition,
} from './strict-enums';

const valid: ValidTestCase<unknown[]>[] = [];
const invalid: InvalidTestCase<MessageIds, unknown[]>[] = [];

/** A function that takes a number enum. */
const fruitFunctionDefinition =
  fruitEnumDefinition +
  `
function useFruit(fruit: Fruit) {}
`;

valid.push({
  name: 'Using a number enum literal on a function that takes a number enum',
  code:
    fruitFunctionDefinition +
    `
useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value on a function that takes a number enum',
  code:
    fruitFunctionDefinition +
    `
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

invalid.push({
  name: 'Using a number literal on a function that takes a number enum',
  code:
    fruitFunctionDefinition +
    `
useFruit(0);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using a number enum literal on a function that takes an enum literal',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit.Apple) {}
useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value on a function that takes an enum literal',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit.Apple) {}
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

invalid.push({
  name: 'Using a number literal on a function that takes an enum literal',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit.Apple) {}
useFruit(0);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using a number enum literal on a function that takes a number enum with a default argument',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit = Fruit.Apple) {}
useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value on a function that takes a number enum with a default argument',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit = Fruit.Apple) {}
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

invalid.push({
  name: 'Using a number literal on a function that takes a number enum with a default argument',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit = Fruit.Apple) {}
useFruit(0);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using a number enum literal on a function that takes a number enum literal with a default argument',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit.Apple = Fruit.Apple) {}
useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value on a function that takes a number enum literal with a default argument',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit.Apple = Fruit.Apple) {}
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

invalid.push({
  name: 'Using a number literal on a function that takes a number enum literal with a default argument',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit.Apple = Fruit.Apple) {}
useFruit(0);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using a number enum literal on a function that takes a number enum | null',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit | null) {}
useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value on a function that takes a number enum | null',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit | null) {}
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

valid.push({
  name: 'Using a null literal on a function that takes a number enum | null',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit | null) {}
useFruit(null);
  `,
});

valid.push({
  name: 'Using a null value on a function that takes a number enum | null',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit | null) {}
const fruit = null;
useFruit(fruit);
  `,
});

invalid.push({
  name: 'Using a number literal on a function that takes a number enum | null',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit | null) {}
useFruit(0);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using a number enum literal on a function that takes a number enum | null with a default argument',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit | null = Fruit.Apple) {}
useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value on a function that takes a number enum | null with a default argument',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit | null = Fruit.Apple) {}
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

valid.push({
  name: 'Using a null literal on a function that takes a number enum | null with a default argument',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit | null = Fruit.Apple) {}
useFruit(null);
  `,
});

valid.push({
  name: 'Using a null value on a function that takes a number enum | null with a default argument',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit | null = Fruit.Apple) {}
const fruit = null;
useFruit(fruit);
  `,
});

invalid.push({
  name: 'Using a number literal on a function that takes a number enum | null with a default argument',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit | null = Fruit.Apple) {}
useFruit(0);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using a number enum literal on a function that takes a number enum literal | null',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit.Apple | null) {}
useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value on a function that takes a number enum literal | null',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit.Apple | null) {}
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

valid.push({
  name: 'Using a null literal on a function that takes a number enum literal | null',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit.Apple | null) {}
useFruit(null);
  `,
});

valid.push({
  name: 'Using a null value on a function that takes a number enum literal | null',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit.Apple | null) {}
const fruit = null;
useFruit(fruit);
  `,
});

invalid.push({
  name: 'Using a number literal on a function that takes a number enum literal | null',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit.Apple | null) {}
useFruit(0);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using a number enum literal on a function that takes a number enum literal | null with a default argument',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit.Apple | null = Fruit.Apple) {}
useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value on a function that takes a number enum literal | null with a default argument',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit.Apple | null = Fruit.Apple) {}
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

valid.push({
  name: 'Using a null literal on a function that takes a number enum literal | null with a default argument',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit.Apple | null = Fruit.Apple) {}
useFruit(null);
  `,
});

valid.push({
  name: 'Using a null value on a function that takes a number enum literal | null with a default argument',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit.Apple | null = Fruit.Apple) {}
const fruit = null;
useFruit(fruit);
  `,
});

invalid.push({
  name: 'Using a number literal on a function that takes a number enum literal | null with a default argument',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit.Apple | null = Fruit.Apple) {}
useFruit(0);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using a number enum literal on a function that takes a number enum literal | number enum literal | null',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit.Apple | Fruit.Banana | null) {}
useFruit(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum value on a function that takes a number enum literal | number enum literal | null',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit.Apple | Fruit.Banana | null) {}
const fruit = Fruit.Apple;
useFruit(fruit);
  `,
});

valid.push({
  name: 'Using a null literal on a function that takes a number enum literal | number enum literal | null',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit.Apple | Fruit.Banana | null) {}
useFruit(null);
  `,
});

valid.push({
  name: 'Using a null value on a function that takes a number enum literal | number enum literal | null',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit.Apple | Fruit.Banana | null) {}
const fruit = null;
useFruit(fruit);
  `,
});

invalid.push({
  name: 'Using a number literal on a function that takes a number enum literal | number enum literal | null',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit.Apple | Fruit.Banana | null) {}
useFruit(0);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using an enum from a composition type on a function that takes a number enum',
  code:
    fruitEnumDefinition +
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

invalid.push({
  name: 'Using a number literal in a Set method',
  code:
    fruitFunctionDefinition +
    `
const fruitNodesSet = new Set([
  Fruit.Apple,
  Fruit.Banana,
]);

fruitNodesSet.has(0);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using a partial union type on a function that takes a number enum',
  code:
    fruitFunctionDefinition +
    `
declare const fruitUnion: Fruit.Apple | Fruit.Banana;
useFruit(fruitUnion);
`,
});

valid.push({
  name: 'Using a partial union type on a function that takes a partial union',
  code:
    fruitEnumDefinition +
    `
function useFruitSubset(fruit: Fruit.Apple | Fruit.Banana) {}
declare const fruitUnion: Fruit.Apple | Fruit.Banana;
useFruit(fruitUnion);
`,
});

invalid.push({
  name: 'Using a number literal on a function that takes a partial union',
  code:
    fruitEnumDefinition +
    `
function useFruitSubset(fruit: Fruit.Apple | Fruit.Banana) {}
useFruit(0);
    `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using a full enum union on a function that takes a number enum',
  code:
    fruitFunctionDefinition +
    `
declare const fruitUnion: Fruit.Apple | Fruit.Banana | Fruit.Pear;
useFruit(fruitUnion);
`,
});

valid.push({
  name: 'Using a full enum union on a function that takes a full enum union',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit.Apple | Fruit.Banana | Fruit.Pear) {}
declare const fruitUnion: Fruit.Apple | Fruit.Banana | Fruit.Pear;
useFruit(fruitUnion);
`,
});

invalid.push({
  name: 'Using a number literal on a function that takes a full enum union',
  code:
    fruitEnumDefinition +
    `
function useFruit(fruit: Fruit.Apple | Fruit.Banana | Fruit.Pear) {}
useFruit(0);
    `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using a partial enum union on a function that takes a number enum (from a type narrowing switch statement)',
  code:
    fruitFunctionDefinition +
    `
declare fruit: Fruit;
switch (fruit) {
  case Fruit.Apple:
  case Fruit.Banana: {
    useFruit(fruit);
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

invalid.push({
  name: 'Using a number literal as a function argument with an enum extension type',
  code:
    fruitEnumDefinition +
    `
class FruitClass<FruitType extends Fruit> {
  constructor(type: FruitType) {
  }
}
const fruitClass = new FruitClass(0);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
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

invalid.push({
  name: 'Using a number array as a function argument with an number enum array type',
  code:
    fruitEnumDefinition +
    `
function useFruitArray(fruitArray: Fruit[]) {}
useFruitArray([0, 1]);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

invalid.push({
  name: 'Using a mixed array as a function argument with an number enum array type',
  code:
    fruitEnumDefinition +
    `
function useFruitArray(fruitArray: Fruit[]) {}
useFruitArray([Fruit.Apple, 1]);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using a number literal for a function with type parameter of number',
  code: `
function useNumber(num: number) {}
useNumber(0);
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

valid.push({
  name: 'Using a string literal for a function with type parameter of string',
  code:
    vegetableEnumDefinition +
    `
function useString(str: string) {}
useString('lettuce');
  `,
});

valid.push({
  name: 'Using a string enum literal for a function with type parameter of string',
  code:
    vegetableEnumDefinition +
    `
function useString(str: string) {}
useString(Vegetable.Lettuce);
  `,
});

valid.push({
  name: 'Using a number literal for a function with type parameter of any',
  code: `
function useAnything(something: any) {}
useAnything(0);
  `,
});

valid.push({
  name: 'Using a number enum literal for a function with type parameter of any',
  code:
    fruitEnumDefinition +
    `
function useAnything(something: any) {}
useAnything(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number literal for a function with type parameter of unknown',
  code: `
function useUnknown(something: unknown) {}
useUnknown(0);
  `,
});

valid.push({
  name: 'Using a number enum literal for a function with type parameter of unknown',
  code:
    fruitEnumDefinition +
    `
function useUnknown(something: unknown) {}
useUnknown(Fruit.Apple);
  `,
});

invalid.push({
  name: 'Using a number literal for a function with type parameter of enum | enum array',
  code:
    fruitEnumDefinition +
    `
function useFruitOrFruitArray(fruitOrFruitArray: Fruit | Fruit[]) {}
useFruitOrFruitArray(0);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using a number enum literal for a function with type parameter of enum | enum array',
  code:
    fruitEnumDefinition +
    `
function useFruitOrFruitArray(fruitOrFruitArray: Fruit | Fruit[]) {}
useFruitOrFruitArray(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum array for a function with type parameter of enum | enum array',
  code:
    fruitEnumDefinition +
    `
function useFruitOrFruitArray(fruitOrFruitArray: Fruit | Fruit[]) {}
useFruitOrFruitArray([Fruit.Apple]);
  `,
});

invalid.push({
  name: 'Using a number array for a function with type parameter of enum | enum array',
  code:
    fruitEnumDefinition +
    `
function useFruitOrFruitArray(fruitOrFruitArray: Fruit | Fruit[]) {}
useFruitOrFruitArray([0]);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

invalid.push({
  name: 'Using a number literal for a variadic function',
  code:
    fruitEnumDefinition +
    `
function useFruits(...fruits: Fruit[]) {}
useFruits(0);
  `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

valid.push({
  name: 'Using a number enum literal for a variadic function',
  code:
    fruitEnumDefinition +
    `
function useFruits(...fruits: Fruit[]) {}
useFruits(Fruit.Apple);
  `,
});

valid.push({
  name: 'Using a number enum literal for a generic function with a default generic type that is unspecified',
  code:
    fruitEnumDefinition +
    `
function toEqual<E = any>(expected: E): void {}
toEqual(Fruit.Apple);
    `,
});

valid.push({
  name: 'Using a number enum literal for a generic function with a default generic type that is specified as any',
  code:
    fruitEnumDefinition +
    `
function toEqual<E = any>(expected: E): void {}
toEqual<any>(Fruit.Apple);
    `,
});

valid.push({
  name: 'Using a number enum literal for a generic function with a default generic type that is specified as a number enum',
  code:
    fruitEnumDefinition +
    `
function toEqual<E = any>(expected: E): void {}
toEqual<Fruit>(Fruit.Apple);
    `,
});

invalid.push({
  name: 'Using a number literal for a generic function with a default generic type that is specified as a number enum',
  code:
    fruitEnumDefinition +
    `
function toEqual<E = any>(expected: E): void {}
toEqual<Fruit>(0);
    `,
  errors: [{ messageId: 'mismatchedFunctionArgument' }],
});

strictEnumsRuleTester.run('strict-enums-comparison', rule, {
  valid,
  invalid,
});
