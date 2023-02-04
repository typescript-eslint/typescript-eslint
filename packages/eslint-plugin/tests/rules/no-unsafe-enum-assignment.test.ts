import rule from '../../src/rules/no-unsafe-enum-assignment';
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

ruleTester.run('no-unsafe-enum-assignment', rule, {
  valid: [
    `
      let fruit = 0;
      fruit++;
    `,
    `
      let fruit = 1;
      fruit--;
    `,
    `
      let fruit = 0;
      ++fruit;
    `,
    `
      let fruit = 1;
      --fruit;
    `,
    `
      let fruit = 1;
      ~fruit;
    `,
    `
      let fruit = 1;
      !fruit;
    `,
    `
      let fruit = 0;
      fruit += 1;
    `,
    `
      let fruit = 0;
      fruit *= 1;
    `,
    `
      let fruit = 0;
      fruit /= 1;
    `,
    `
      let fruit = 1;
      fruit -= 1;
    `,
    `
      let fruits;
      fruits = [0];
    `,
    `
      enum Fruit {
        Apple,
      }
      let fruits;
      fruits = [Fruit.Apple];
    `,
    `
      enum Fruit {
        Apple,
      }
      let fruit = Fruit.Apple;
      !fruit;
    `,
    `
      enum Fruit {
        Apple,
      }
      let fruits: Fruit[];
      fruits = [Fruit.Apple];
    `,
    `
      enum Fruit {
        Apple,
      }
      let fruit = Fruit.Apple;
      fruit = Fruit.Apple;
    `,
    `
      enum Fruit {
        Apple,
      }
      let fruit: Fruit;
      fruit = Fruit.Apple;
    `,
    `
      enum Fruit {
        Apple,
      }
      let fruit;
      fruit = Fruit.Apple;
    `,
    `
      enum Fruit {
        Apple,
        Banana,
      }
      let fruits: Fruit[];
      fruits = [Fruit.Apple, Fruit.Banana];
    `,
    `
      enum Fruit {
        Apple,
      }
      const x: { prop: Fruit } = { prop: Fruit.Apple };
    `,
    `
      enum Fruit {
        Apple,
      }
      const values = { prop: Fruit.Apple };
      const x: { prop: Fruit } = { ...values };
    `,
    `
      enum Fruit {
        Apple,
      }
      const values = { unrelated: 0, prop: 1 };
      const overrides = { prop: Fruit.Apple };
      const x: { prop: Fruit } = { ...values, ...overrides };
    `,
    `
      enum Fruit {
        Apple,
      }
      const values = { prop: Fruit.Apple };
      const x: { prop: Fruit }[] = [{ ...values }];
    `,
    `
      enum Fruit {
        Apple,
      }
      declare function useFruit(fruit: Fruit): void;
      useFruit(Fruit.Apple);
    `,
    `
      enum Fruit {
        Apple,
        Banana = '',
      }
      declare function useFruit(fruit: Fruit.Apple): void;
      useFruit(Fruit.Apple);
    `,
    `
      enum Fruit {
        Apple,
      }
      declare function useFruit(fruit: Fruit | -1): void;
      useFruit(-1);
    `,
    `
      enum Fruit {
        Apple = 0,
        Banana = '',
      }
      declare function useFruit(fruit: Fruit | any): void;
      useFruit(1);
    `,
    `
      enum Fruit {
        Apple = 0,
        Banana = '',
      }
      declare function useFruit(fruit: Fruit | number): void;
      useFruit(1);
    `,
    `
      enum Fruit {
        Apple = 0,
        Banana = '',
      }
      declare function useFruit(fruit: Fruit | string): void;
      useFruit(1);
    `,
    `
      enum Fruit {
        Apple,
      }
      declare function useFruit(fruit: Fruit | null): void;
      useFruit(Fruit.Apple);
    `,
    `
      enum Fruit {
        Apple,
      }
      declare function useFruit(fruit: Fruit | string): void;
      useFruit(Math.random() > 0.5 ? Fruit.Apple : '');
    `,
    `
      enum Fruit {
        Apple,
        Banana,
      }
      declare function useFruit(fruit: Fruit): void;
      useFruit(Math.random() > 0.5 ? Fruit.Apple : Fruit.Banana);
    `,
    `
      enum Fruit {
        Apple,
      }
      declare function useFruit(fruit: Fruit | null): void;
      useFruit(Math.random() > 0.5 ? Fruit.Apple : null);
    `,
    `
      enum Fruit {
        Apple,
      }
      declare function useFruit(fruit: Fruit): void;
      useFruit({} as any);
    `,
    `
      enum Fruit {
        Apple,
      }
      declare function useFruit(fruit: Fruit | undefined): void;
      useFruit(undefined);
    `,
    `
      enum Fruit {
        Apple,
      }
      declare function useFruit(fruit: Fruit, a: number): void;
      useFruit(Fruit.Apple, -1);
    `,
    `
      enum Fruit {
        Apple,
      }
      declare function useFruit(fruit: Fruit, a: number, b: number): void;
      useFruit(Fruit.Apple, -1, -1);
    `,
    `
      enum Fruit {
        Apple,
      }
      declare function useFruit(a: number, fruit: Fruit, b: number): void;
      useFruit(-1, Fruit.Apple, -1);
    `,
    `
      enum Fruit {
        Apple,
      }
      declare function useFruits(fruits: Fruit[]): void;
      useFruit([Fruit.Apple]);
    `,
    `
      enum Fruit {
        Apple,
        Banana,
      }
      declare function useFruits(...fruits: Fruit[]): void;
      useFruit(Fruit.Apple, Fruit.Banana);
    `,
    `
      enum Fruit {
        Apple,
        Banana,
      }
      declare function useFruits(a: number, ...fruits: Fruit[]): void;
      useFruit(1, Fruit.Apple, Fruit.Banana);
    `,
    `
      enum Fruit {
        Apple,
      }
      declare function giveFruit(): Fruit {
        return Fruit.Apple;
      };
    `,
    `
      enum Fruit {
        Apple,
      }
      declare function giveFruit(): Fruit[] {
        return [Fruit.Apple];
      };
    `,
    `
      enum Fruit {
        Apple,
      }
      class F {
        prop: Fruit = Fruit.Apple;
      }
    `,
    `
      enum Fruit {
        Apple,
      }
      interface F {
        prop: Fruit;
      }
      class Foo implements F {
        prop = Fruit.Apple;
      }
    `,
    `
      declare enum Fruit {
        Apple,
      }
      interface F {
        prop: Fruit;
      }
      class Foo implements F {
        prop = Fruit.Apple;
      }
    `,
    `
      declare enum Fruit {
        Apple,
      }
      interface Unrelated {
        other: Fruit;
      }
      class Foo implements Unrelated {
        other = Fruit.Apple;
        prop = 1;
      }
    `,
    {
      code: `
        enum Fruit {
          Apple,
        }
        const Component = (props: { fruit: Fruit }) => null;
        <Component fruit={Fruit.Apple} />;
      `,
      filename: 'react.tsx',
    },
  ],
  invalid: [
    {
      code: `
        enum Fruit {
          Apple,
        }
        let fruit = Fruit.Apple;
        fruit++;
      `,
      errors: [{ data: { operator: '++' }, messageId: 'operation' }],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        let fruit = Fruit.Apple;
        fruit--;
      `,
      errors: [{ data: { operator: '--' }, messageId: 'operation' }],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        let fruit = Fruit.Apple;
        ++fruit;
      `,
      errors: [{ data: { operator: '++' }, messageId: 'operation' }],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        let fruit = Fruit.Apple;
        --fruit;
      `,
      errors: [{ data: { operator: '--' }, messageId: 'operation' }],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        let fruit = Fruit.Apple;
        fruit += 1;
      `,

      errors: [{ messageId: 'provided' }],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        let fruit = Fruit.Apple;
        fruit -= 1;
      `,

      errors: [{ messageId: 'provided' }],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        let fruit = Fruit.Apple;
        fruit |= 1;
      `,
      errors: [{ messageId: 'provided' }],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        let fruit = Fruit.Apple;
        fruit &= 1;
      `,
      errors: [{ messageId: 'provided' }],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        let fruit = Fruit.Apple;
        fruit ^= 1;
      `,
      errors: [{ messageId: 'provided' }],
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
          column: 17,
          endColumn: 18,
          line: 6,
          messageId: 'provided',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        let fruits: Fruit[];
        fruits = [0];
      `,
      errors: [
        {
          column: 18,
          endColumn: 21,
          line: 6,
          messageId: 'provided',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        let fruits: Fruit[];
        fruits = [0, 1];
      `,
      errors: [
        {
          column: 18,
          endColumn: 24,
          line: 6,
          messageId: 'provided',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        let fruits: Fruit[];
        fruits = [0, Fruit.Apple];
      `,
      errors: [
        {
          column: 18,
          endColumn: 34,
          line: 6,
          messageId: 'provided',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        const x: { prop: Fruit } = { prop: 1 };
      `,
      errors: [
        {
          data: { name: 'prop' },
          column: 38,
          endColumn: 42,
          line: 5,
          messageId: 'provided',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        const values = { prop: 1 };
        const x: { prop: Fruit } = { ...values };
      `,
      errors: [
        {
          data: { name: 'prop' },
          column: 36,
          endColumn: 49,
          line: 6,
          messageId: 'providedProperty',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        declare const values: { prop: 1 };
        const x: { prop: Fruit } = { ...values };
      `,
      errors: [
        {
          data: { name: 'prop' },
          column: 36,
          endColumn: 49,
          line: 6,
          messageId: 'providedProperty',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        declare const values: { prop: number };
        const x: { prop: Fruit } = { ...values };
      `,
      errors: [
        {
          data: { name: 'prop' },
          column: 36,
          endColumn: 49,
          line: 6,
          messageId: 'providedProperty',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        const values = { prop: 1 };
        const unrelated = { other: 2 };
        const x: { prop: Fruit } = { ...unrelated, ...values };
      `,
      errors: [
        {
          data: { name: 'prop' },
          column: 36,
          endColumn: 63,
          line: 7,
          messageId: 'providedProperty',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        const values = { prop: 1 };
        const unrelated = { other: 2 };
        const x: { prop: Fruit } = { ...values, ...unrelated };
      `,
      errors: [
        {
          data: { name: 'prop' },
          column: 36,
          endColumn: 63,
          line: 7,
          messageId: 'providedProperty',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        const values = { prop: 1 };
        const overridden = { prop: Fruit.Apple };
        const x: { prop: Fruit } = { ...overridden, ...values };
      `,
      errors: [
        {
          data: { name: 'prop' },
          column: 36,
          endColumn: 64,
          line: 7,
          messageId: 'providedProperty',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        const values = { prop: 1 };
        const x: { prop: Fruit } = values;
      `,
      errors: [
        {
          data: { name: 'prop' },
          column: 36,
          endColumn: 42,
          line: 6,
          messageId: 'providedProperty',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        const values = { prop: 1 };
        const x: { prop: Fruit }[] = [values];
      `,
      errors: [
        {
          data: { name: 'prop' },
          column: 36,
          endColumn: 42,
          line: 6,
          messageId: 'providedProperty',
        },
      ],
    },
    // todo: handle object nesting, and nested arrays of objects...
    {
      code: `
        enum Fruit {
          Apple,
        }
        declare function useFruit(fruit: Fruit): void;
        useFruit(0);
      `,
      errors: [
        {
          column: 18,
          endColumn: 19,
          line: 6,
          messageId: 'provided',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        declare function useFruit<FruitType extends Fruit>(fruit: FruitType): void;
        useFruit(0);
      `,
      errors: [
        {
          column: 18,
          endColumn: 19,
          line: 6,
          messageId: 'provided',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        declare function useFruits(fruits: Fruit[]): void;
        useFruits([0]);
      `,
      errors: [
        {
          column: 19,
          endColumn: 22,
          line: 6,
          messageId: 'provided',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        declare function useFruits(fruits: Fruit[]): void;
        useFruits([0, Fruit.Apple]);
      `,
      errors: [
        {
          column: 19,
          endColumn: 35,
          line: 6,
          messageId: 'provided',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        declare function useFruits(...fruits: Fruit[]): void;
        useFruits(0);
      `,
      errors: [
        {
          column: 19,
          endColumn: 20,
          line: 6,
          messageId: 'provided',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        declare function useFruits(a: number, ...fruits: Fruit[]): void;
        useFruits(0, Fruit.Apple, 0);
      `,
      errors: [
        {
          column: 35,
          endColumn: 36,
          line: 6,
          messageId: 'provided',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        declare function giveFruit(): Fruit {
          return 1;
        };
      `,
      errors: [
        {
          // (todo: correct numbers)
          column: -1,
          endColumn: -1,
          line: -1,
          messageId: 'provided',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        declare function giveFruit(): Fruit[] {
          return [1];
        };
      `,
      errors: [
        {
          // (todo: correct numbers)
          column: -1,
          endColumn: -1,
          line: -1,
          messageId: 'provided',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        const values = new Set<Fruit>();
        values.add(0);
      `,
      errors: [
        {
          column: 20,
          endColumn: 21,
          line: 6,
          messageId: 'provided',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        class F {
          prop: Fruit = 1;
        }
      `,
      errors: [
        {
          column: 25,
          endColumn: 26,
          line: 6,
          messageId: 'provided',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        interface F {
          prop: Fruit;
        }
        class Foo implements F {
          prop = 1;
        }
      `,
      errors: [
        {
          column: 18,
          endColumn: 19,
          line: 9,
          messageId: 'provided',
        },
      ],
    },
    {
      code: `
        declare enum Fruit {
          Apple,
        }
        interface F {
          prop: Fruit;
        }
        class Foo implements F {
          prop = 1;
        }
      `,
      errors: [
        {
          column: 18,
          endColumn: 19,
          line: 9,
          messageId: 'provided',
        },
      ],
    },
    {
      code: `
        declare enum Fruit {
          Apple,
        }
        interface F {
          prop: Fruit;
        }
        interface Unrelated {
          other: Fruit;
        }
        class Foo implements F, Unrelated {
          prop = 1;
        }
      `,
      errors: [
        {
          column: 18,
          endColumn: 19,
          line: 12,
          messageId: 'provided',
        },
      ],
    },
    {
      code: `
        declare enum Fruit {
          Apple,
        }
        interface F {
          prop: Fruit;
        }
        interface Unrelated {
          other: Fruit;
        }
        class Foo implements Unrelated, F {
          prop = 1;
        }
      `,
      errors: [
        {
          column: 18,
          endColumn: 19,
          line: 12,
          messageId: 'provided',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        const Component = (props: { fruit: Fruit }) => null;
        <Component fruit={1} />;
      `,
      errors: [
        {
          // (todo: correct numbers)
          column: -1,
          endColumn: -1,
          line: -1,
          messageId: 'provided',
        },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        const Component = (props: { fruit: Fruit[] }) => null;
        <Component fruit={[1]} />;
      `,
      errors: [
        {
          // (todo: correct numbers)
          column: -1,
          endColumn: -1,
          line: -1,
          messageId: 'provided',
        },
      ],
    },
  ],
});

// For more todos: https://github.com/typescript-eslint/typescript-eslint/pull/6091#issuecomment-1407857817
