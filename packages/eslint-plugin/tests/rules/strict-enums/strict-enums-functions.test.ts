import rule from '../../../src/rules/strict-enums';
import {
  fruitEnumDefinition,
  strictEnumsRuleTester,
  vegetableEnumDefinition,
} from './strict-enums';

/** A function that takes a number enum. */
const fruitFunctionDefinition =
  fruitEnumDefinition +
  `
function useFruit(fruit: Fruit) {}
`;

strictEnumsRuleTester.run('strict-enums-functions', rule, {
  valid: [
    {
      code: `
useFruit(0);
      `,
    },

    {
      code:
        fruitFunctionDefinition +
        `
    useFruit(Fruit.Apple);
      `,
    },

    {
      code:
        fruitFunctionDefinition +
        `
    declare const fruit: Fruit.Apple;
    useFruit(fruit);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple) {}
    useFruit(Fruit.Apple);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple) {}
    useFruit(Fruit.Banana);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple) {}
    declare const fruit: Fruit.Apple;
    useFruit(fruit);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple) {}
    declare const fruit: Fruit.Banana;
    useFruit(fruit);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit = Fruit.Apple) {}
    useFruit(Fruit.Apple);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit = Fruit.Apple) {}
    const fruit = Fruit.Apple;
    useFruit(fruit);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple = Fruit.Apple) {}
    useFruit(Fruit.Apple);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple = Fruit.Apple) {}
    const fruit = Fruit.Apple;
    useFruit(fruit);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit | null) {}
    useFruit(Fruit.Apple);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit | null) {}
    const fruit = Fruit.Apple;
    useFruit(fruit);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit | null) {}
    useFruit(null);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit | null) {}
    const fruit = null;
    useFruit(fruit);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit | null = Fruit.Apple) {}
    useFruit(Fruit.Apple);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit | null = Fruit.Apple) {}
    const fruit = Fruit.Apple;
    useFruit(fruit);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit | null = Fruit.Apple) {}
    useFruit(null);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit | null = Fruit.Apple) {}
    const fruit = null;
    useFruit(fruit);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple | null) {}
    useFruit(Fruit.Apple);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple | null) {}
    const fruit = Fruit.Apple;
    useFruit(fruit);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple | null) {}
    useFruit(null);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple | null) {}
    const fruit = null;
    useFruit(fruit);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple | null = Fruit.Apple) {}
    useFruit(Fruit.Apple);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple | null = Fruit.Apple) {}
    const fruit = Fruit.Apple;
    useFruit(fruit);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple | null = Fruit.Apple) {}
    useFruit(null);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple | null = Fruit.Apple) {}
    const fruit = null;
    useFruit(fruit);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple | Fruit.Banana | null) {}
    useFruit(Fruit.Apple);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple | Fruit.Banana | null) {}
    const fruit = Fruit.Apple;
    useFruit(fruit);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple | Fruit.Banana | null) {}
    useFruit(null);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple | Fruit.Banana | null) {}
    const fruit = null;
    useFruit(fruit);
      `,
    },

    {
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
    },

    {
      code:
        fruitEnumDefinition +
        `
    const fruitSet = new Set([
      Fruit.Apple,
      Fruit.Banana,
    ]);

    fruitSet.has(Fruit.Apple);
      `,
    },

    {
      code:
        fruitFunctionDefinition +
        `
    declare const fruitUnion: Fruit.Apple | Fruit.Banana;
    useFruit(fruitUnion);
    `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple | Fruit.Banana) {}
    declare const fruitUnion: Fruit.Apple | Fruit.Banana;
    useFruit(fruitUnion);
    `,
    },

    {
      code:
        fruitFunctionDefinition +
        `
    declare const fruitUnion: Fruit.Apple | Fruit.Banana | Fruit.Pear;
    useFruit(fruitUnion);
    `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple | Fruit.Banana | Fruit.Pear) {}
    declare const fruitUnion: Fruit.Apple | Fruit.Banana | Fruit.Pear;
    useFruit(fruitUnion);
    `,
    },

    {
      code:
        fruitFunctionDefinition +
        `
    declare const fruit: Fruit;
    switch (fruit) {
      case Fruit.Apple:
      case Fruit.Banana: {
        useFruit(fruit);
      }
    }
    `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit<FruitType extends number>(fruitType: FruitType) {}
    useFruit(Fruit.Apple);
    `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit<FruitType extends number>(fruitType: FruitType) {}
    useFruit(0);
    `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit<FruitType extends Fruit>(fruitType: FruitType) {}
    useFruit(Fruit.Apple);
    `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    class FruitClass<FruitType extends Fruit> {
      constructor(type: FruitType) {}
      useFruit(type: FruitType) {}
    }
    const fruitClass = new FruitClass(Fruit.Apple);
    fruitClass.useFruit(Fruit.Apple);
    `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useNumbers(numberArray: number[]) {}
    useNumbers([0, 1]);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruitArray: Fruit[]) {}
    useFruit([Fruit.Apple, Fruit.Banana]);
      `,
    },

    {
      code: `
function useNumber(num: number) {}
useNumber(0);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useNumber(num: number) {}
    useNumber(Fruit.Apple);
      `,
    },

    {
      code:
        vegetableEnumDefinition +
        `
    function useString(str: string) {}
    useString('lettuce');
      `,
    },

    {
      code:
        vegetableEnumDefinition +
        `
    function useString(str: string) {}
    useString(Vegetable.Lettuce);
      `,
    },

    {
      code: `
function useAnything(something: any) {}
useAnything(0);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useAnything(something: any) {}
    useAnything(Fruit.Apple);
      `,
    },

    {
      code: `
function useUnknown(something: unknown) {}
useUnknown(0);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useUnknown(something: unknown) {}
    useUnknown(Fruit.Apple);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruitOrFruitArray: Fruit | Fruit[]) {}
    useFruit(Fruit.Apple);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruitOrFruitArray: Fruit | Fruit[]) {}
    useFruit([Fruit.Apple, Fruit.Banana]);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruitOrFruitArray: Fruit | Fruit[]) {}
    declare const fruit: Fruit | Fruit[];
    useFruit(fruit);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruitOrFruitArray: number | Fruit[]) {}
    useFruit(0);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruitOrFruitArray: number | Fruit[]) {}
    useFruit([Fruit.Apple, Fruit.Banana]);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(...fruits: Fruit[]) {}
    useFruit(Fruit.Apple);
    useFruit(Fruit.Apple, Fruit.Banana);
      `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function toEqual<E = any>(expected: E): void {}
    toEqual(Fruit.Apple);
        `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function toEqual<E = Fruit>(expected: E): void {}
    toEqual(Fruit.Apple);
        `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function toEqual<E = any>(expected: E): void {}
    toEqual<any>(Fruit.Apple);
        `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function toEqual<E = any>(expected: E): void {}
    toEqual<Fruit>(Fruit.Apple);
        `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function toEqual<E = any>(arg1: number, expected: E): void {}
    toEqual(0, Fruit.Apple);
        `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function toEqual<E = Fruit>(arg1: number, expected: E): void {}
    toEqual(0, Fruit.Apple);
        `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function toEqual<E = any>(arg1: number, expected: E): void {}
    toEqual<any>(0, Fruit.Apple);
        `,
    },

    {
      code:
        fruitEnumDefinition +
        `
    function toEqual<E = any>(arg1: number, expected: E): void {}
    toEqual<Fruit>(0, Fruit.Apple);
        `,
    },

    {
      code: `
JSON.stringify({}, (_, value: unknown) => value ?? undefined, 2);
      `,
    },

    {
      code: `
function flatten<T>(arr: T[][]): T[] {
  return arr.reduce((acc, a) => acc.concat(a), []);
}
      `,
    },
  ],
  invalid: [
    {
      code:
        fruitFunctionDefinition +
        `
    useFruit(0);
      `,
      errors: [{ messageId: 'mismatchedFunctionArgument' }],
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple) {}
    useFruit(0);
      `,
      errors: [{ messageId: 'mismatchedFunctionArgument' }],
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit = Fruit.Apple) {}
    useFruit(0);
      `,
      errors: [{ messageId: 'mismatchedFunctionArgument' }],
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple = Fruit.Apple) {}
    useFruit(0);
      `,
      errors: [{ messageId: 'mismatchedFunctionArgument' }],
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit | null) {}
    useFruit(0);
      `,
      errors: [{ messageId: 'mismatchedFunctionArgument' }],
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit | null = Fruit.Apple) {}
    useFruit(0);
      `,
      errors: [{ messageId: 'mismatchedFunctionArgument' }],
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple | null) {}
    useFruit(0);
      `,
      errors: [{ messageId: 'mismatchedFunctionArgument' }],
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple | null = Fruit.Apple) {}
    useFruit(0);
      `,
      errors: [{ messageId: 'mismatchedFunctionArgument' }],
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple | Fruit.Banana | null) {}
    useFruit(0);
      `,
      errors: [{ messageId: 'mismatchedFunctionArgument' }],
    },

    {
      code:
        fruitEnumDefinition +
        `
    const fruitSet = new Set([
      Fruit.Apple,
      Fruit.Banana,
    ]);

    fruitSet.has(0);
      `,
      errors: [{ messageId: 'mismatchedFunctionArgument' }],
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple | Fruit.Banana) {}
    useFruit(0);
        `,
      errors: [{ messageId: 'mismatchedFunctionArgument' }],
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruit: Fruit.Apple | Fruit.Banana | Fruit.Pear) {}
    useFruit(0);
        `,
      errors: [{ messageId: 'mismatchedFunctionArgument' }],
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit<FruitType extends Fruit>(fruitType: FruitType) {}
    useFruit(0);
    `,
      errors: [{ messageId: 'mismatchedFunctionArgument' }],
    },

    {
      code:
        fruitEnumDefinition +
        `
    class FruitClass<FruitType extends Fruit> {
      constructor(type: FruitType) {}
      useFruit(type: FruitType) {}
    }
    const fruitClass = new FruitClass(0);
    fruitClass.useFruit(0);
      `,
      errors: [
        { messageId: 'mismatchedFunctionArgument' },
        { messageId: 'mismatchedFunctionArgument' },
      ],
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruitArray: Fruit[]) {}
    useFruit([0, 1]);
      `,
      errors: [{ messageId: 'mismatchedFunctionArgument' }],
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruitArray: Fruit[]) {}
    useFruit([Fruit.Apple, 1]);
      `,
      errors: [{ messageId: 'mismatchedFunctionArgument' }],
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruitOrFruitArray: Fruit | Fruit[]) {}
    useFruit(0);
      `,
      errors: [{ messageId: 'mismatchedFunctionArgument' }],
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruitOrFruitArray: Fruit | Fruit[]) {}
    useFruit([0, 1]);
      `,
      errors: [{ messageId: 'mismatchedFunctionArgument' }],
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(fruitOrFruitArray: number | Fruit[]) {}
    useFruit([0, 1]);
      `,
      errors: [{ messageId: 'mismatchedFunctionArgument' }],
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(...fruits: Fruit[]) {}
    useFruit(0);
      `,
      errors: [{ messageId: 'mismatchedFunctionArgument' }],
    },

    {
      code:
        fruitEnumDefinition +
        `
    function useFruit(...fruits: Fruit[]) {}
    useFruit(Fruit.Apple, 0);
      `,
      errors: [{ messageId: 'mismatchedFunctionArgument' }],
    },

    {
      code:
        fruitEnumDefinition +
        `
    function toEqual<E = any>(expected: E): void {}
    toEqual<Fruit>(0);
        `,
      errors: [{ messageId: 'mismatchedFunctionArgument' }],
    },

    {
      code:
        fruitEnumDefinition +
        `
    function toEqual<E = any>(arg1: number, expected: E): void {}
    toEqual<Fruit>(0, 0);
        `,
      errors: [{ messageId: 'mismatchedFunctionArgument' }],
    },
  ],
});
