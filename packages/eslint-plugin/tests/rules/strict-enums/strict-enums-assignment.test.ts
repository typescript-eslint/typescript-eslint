import rule from '../../../src/rules/strict-enums';
import {
  fruit2EnumDefinition,
  fruitEnumDefinition,
  strictEnumsRuleTester,
} from './shared';

strictEnumsRuleTester.run('strict-enums-assignment', rule, {
  valid: [
    {
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
    },
    {
      code: `
const myArray = [1];
const [firstElement] = myArray;
      `,
    },
    {
      code:
        fruitEnumDefinition +
        `
const fruit = Fruit.Apple;
  `,
    },
    {
      code:
        fruitEnumDefinition +
        `
const fruit: Fruit = Fruit.Apple;
  `,
    },
    {
      code:
        fruitEnumDefinition +
        `
const apple = Fruit.Apple;
const fruit: Fruit = apple;
  `,
    },
    {
      code:
        fruitEnumDefinition +
        `
  let fruit = Fruit.Apple;
  fruit = Fruit.Banana;
    `,
    },
    {
      code:
        fruitEnumDefinition +
        `
  const fruit: Fruit | null = Fruit.Apple;
    `,
    },
    {
      code:
        fruitEnumDefinition +
        `
  const fruit: Fruit | null = null;
    `,
    },
    {
      code:
        fruitEnumDefinition +
        `
  let fruit: Fruit | null = null;
  fruit = Fruit.Apple;
    `,
    },
    {
      code:
        fruitEnumDefinition +
        `
  let fruit: Fruit | null = Fruit.Apple;
  fruit = null;
    `,
    },
    {
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
    },
    {
      // Intersection types are always allowed

      code:
        fruitEnumDefinition +
        fruit2EnumDefinition +
        `
const foo: Fruit & Fruit2 = Fruit.Apple;
  `,
    },
    {
      code: `
enum Flag {
  Value1 = 1 << 0,
  Value2 = 1 << 1,
}
const flags = Flag.Value1 | Flag.Value2;
      `,
    },
    {
      code:
        fruitEnumDefinition +
        `
    declare let fruits: Fruit[];
    fruits = [Fruit.Apple, Fruit.Banana];
      `,
    },
    {
      code:
        fruitEnumDefinition +
        `
    declare let numbers: number[];
    numbers = [Fruit.Apple, Fruit.Banana];
      `,
    },
    {
      code:
        fruitEnumDefinition +
        `
    const fruitArray: Fruit[] = [];
      `,
    },
    {
      code:
        fruitEnumDefinition +
        `
    const fruitFlags = Fruit.Apple | Fruit.Banana;
      `,
    },
  ],
  invalid: [
    {
      code:
        fruitEnumDefinition +
        `
    const fruit: Fruit = 0;
      `,
      errors: [{ messageId: 'mismatchedAssignment' }],
    },
    {
      code:
        fruitEnumDefinition +
        `
  let fruit = Fruit.Apple;
  fruit = 1;
    `,
      errors: [{ messageId: 'mismatchedAssignment' }],
    },
    {
      code:
        fruitEnumDefinition +
        `
  const fruit: Fruit = Fruit;
    `,
      errors: [{ messageId: 'mismatchedAssignment' }],
    },
    {
      code:
        fruitEnumDefinition +
        fruit2EnumDefinition +
        `
  const fruit: Fruit = Fruit2.Apple2;
    `,
      errors: [{ messageId: 'mismatchedAssignment' }],
    },
    {
      code:
        fruitEnumDefinition +
        `
  const fruit: Fruit | null = 0;
    `,
      errors: [{ messageId: 'mismatchedAssignment' }],
    },
    {
      code:
        fruitEnumDefinition +
        `
    let fruit: Fruit | null = null;
    fruit = 0;
      `,
      errors: [{ messageId: 'mismatchedAssignment' }],
    },
    {
      code:
        fruitEnumDefinition +
        `
    declare const fruit: Fruit | number;
    const fruitCopy: Fruit = fruit;
      `,
      errors: [{ messageId: 'mismatchedAssignment' }],
    },
    {
      code:
        fruitEnumDefinition +
        `
    declare let fruits: Fruit[];
    fruits = [0, 1];
      `,
      errors: [{ messageId: 'mismatchedAssignment' }],
    },
    {
      code:
        fruitEnumDefinition +
        fruit2EnumDefinition +
        `
    declare let fruits: Fruit[];
    fruits = [Fruit2.Apple2, Fruit2.Banana2];
      `,
      errors: [{ messageId: 'mismatchedAssignment' }],
    },
  ],
});
