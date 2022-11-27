import rule from '../../src/rules/no-unsafe-enum-comparison';
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

ruleTester.run('strict-enums-comparison', rule, {
  valid: [
    "'a' == 'b';",
    "'a' === 'b';",
    '1 == 2;',
    '1 === 2;',
    `
      enum Fruit {
        Apple,
      }
      Fruit.Apple === ({} as any);
    `,
    `
      enum Fruit {
        Apple,
      }
      Fruit.Apple === undefined;
    `,
    `
      enum Fruit {
        Apple,
      }
      Fruit.Apple === null;
    `,
    `
      enum Fruit {
        Apple,
      }
      declare const fruit: Fruit | -1;
      fruit === -1;
    `,
    `
      enum Fruit {
        Apple,
      }
      declare const fruit: Fruit | number;
      fruit === -1;
    `,
    `
      enum Fruit {
        Apple,
      }
      declare const fruit: Fruit | 'apple';
      fruit === 'apple';
    `,
    `
      enum Fruit {
        Apple,
      }
      declare const fruit: Fruit | string;
      fruit === 'apple';
    `,
    `
      enum Fruit {
        Apple = 'apple',
      }
      declare const fruit: Fruit | 'apple';
      fruit === 'apple';
    `,
    `
      enum Fruit {
        Apple = 'apple',
      }
      declare const fruit: Fruit | string;
      fruit === 'apple';
    `,
    `
      enum Fruit {
        Apple = 'apple',
      }
      declare const fruit: Fruit | 0;
      fruit === 0;
    `,
    `
      enum Fruit {
        Apple = 'apple',
      }
      declare const fruit: Fruit | number;
      fruit === 0;
    `,
    `
      enum Fruit {
        Apple,
      }
      declare const fruit: Fruit | 'apple';
      fruit === Math.random() > 0.5 ? 'apple' : Fruit.Apple;
    `,
    `
      enum Fruit {
        Apple = 'apple',
      }
      declare const fruit: Fruit | 'apple';
      fruit === Math.random() > 0.5 ? 'apple' : Fruit.Apple;
    `,
    `
      enum Fruit {
        Apple = 'apple',
      }
      declare const fruit: Fruit | string;
      fruit === Math.random() > 0.5 ? 'apple' : Fruit.Apple;
    `,
    `
      enum Fruit {
        Apple = 'apple',
      }
      declare const fruit: Fruit | 0;
      fruit === Math.random() > 0.5 ? 0 : Fruit.Apple;
    `,
    `
      enum Fruit {
        Apple = 'apple',
      }
      declare const fruit: Fruit | number;
      fruit === Math.random() > 0.5 ? 0 : Fruit.Apple;
    `,
    `
      enum Fruit {
        Apple,
        Banana,
      }
      Fruit.Apple === Fruit.Banana;
    `,
    `
      enum Fruit {
        Apple = 0,
        Banana = 1,
      }
      Fruit.Apple === Fruit.Banana;
    `,
    `
      enum Fruit {
        Apple = 'apple',
        Banana = 'banana',
      }
      Fruit.Apple === Fruit.Banana;
    `,
    `
      enum Fruit {
        Apple,
        Banana,
      }
      const fruit = Fruit.Apple;
      fruit === Fruit.Banana;
    `,
    `
      enum Vegetable {
        Asparagus = 'asparagus',
        Beet = 'beet',
        Celery = 'celery',
      }
      const vegetable = Vegetable.Asparagus;
      vegetable === Vegetable.Beet;
    `,
    `
      enum Fruit {
        Apple,
        Banana,
        Cherry,
      }
      const fruit1 = Fruit.Apple;
      const fruit2 = Fruit.Banana;
      fruit1 === fruit2;
    `,
    `
      enum Vegetable {
        Asparagus = 'asparagus',
        Beet = 'beet',
        Celery = 'celery',
      }
      const vegetable1 = Vegetable.Asparagus;
      const vegetable2 = Vegetable.Beet;
      vegetable1 === vegetable2;
    `,
    `
      enum Fruit {
        Apple,
        Banana,
        Cherry,
      }
      enum Fruit2 {
        Apple2,
        Banana2,
        Cherry2,
      }
      declare const left: number | Fruit;
      declare const right: number | Fruit2;
      left === right;
    `,
    `
      enum Vegetable {
        Asparagus = 'asparagus',
        Beet = 'beet',
        Celery = 'celery',
      }
      enum Vegetable2 {
        Asparagus2 = 'asparagus2',
        Beet2 = 'beet2',
        Celery2 = 'celery2',
      }
      declare const left: string | Vegetable;
      declare const right: string | Vegetable2;
      left === right;
    `,
    `
      enum Vegetable {
        Asparagus = 'asparagus',
        Beet = 'beet',
        Celery = 'celery',
      }
      type WeirdString = string & { __someBrand: void };
      declare const weirdString: WeirdString;
      Vegetable.Asparagus === weirdString;
    `,
    `
      enum Vegetable {
        Asparagus = 'asparagus',
        Beet = 'beet',
        Celery = 'celery',
      }
      const foo = {};
      const vegetable = Vegetable.Asparagus;
      vegetable in foo;
    `,
    `
      enum Fruit {
        Apple,
        Banana,
        Cherry,
      }
      declare const fruitOrBoolean: Fruit | boolean;
      fruitOrBoolean === true;
    `,
    `
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
  ],
  invalid: [
    {
      code: `
        enum Fruit {
          Apple,
        }
        Fruit.Apple == 1;
      `,
      errors: [{ messageId: 'mismatched' }],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        Fruit.Apple === 1;
      `,
      errors: [{ messageId: 'mismatched' }],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        Fruit.Apple != 1;
      `,
      errors: [{ messageId: 'mismatched' }],
    },
    {
      code: `
        enum Fruit {
          Apple,
        }
        Fruit.Apple !== 1;
      `,
      errors: [{ messageId: 'mismatched' }],
    },
    {
      code: `
        enum Fruit {
          Apple = 0,
          Banana = 'banana',
        }
        Fruit.Apple === 0;
      `,
      errors: [{ messageId: 'mismatched' }],
    },
    {
      code: `
        enum Fruit {
          Apple = 0,
          Banana = 'banana',
        }
        Fruit.Banana === '';
      `,
      errors: [{ messageId: 'mismatched' }],
    },
    {
      code: `
        enum Vegetable {
          Asparagus = 'asparagus',
          Beet = 'beet',
          Celery = 'celery',
        }
        Vegetable.Asparagus === 'beet';
      `,
      errors: [{ messageId: 'mismatched' }],
    },
    {
      code: `
        enum Fruit {
          Apple,
          Banana,
          Cherry,
        }
        1 === Fruit.Apple;
      `,
      errors: [{ messageId: 'mismatched' }],
    },
    {
      code: `
        enum Vegetable {
          Asparagus = 'asparagus',
          Beet = 'beet',
          Celery = 'celery',
        }
        'beet' === Vegetable.Asparagus;
      `,
      errors: [{ messageId: 'mismatched' }],
    },
    {
      code: `
        enum Fruit {
          Apple,
          Banana,
          Cherry,
        }
        const fruit = Fruit.Apple;
        fruit === 1;
      `,
      errors: [{ messageId: 'mismatched' }],
    },
    {
      code: `
        enum Vegetable {
          Asparagus = 'asparagus',
          Beet = 'beet',
          Celery = 'celery',
        }
        const vegetable = Vegetable.Asparagus;
        vegetable === 'beet';
      `,
      errors: [{ messageId: 'mismatched' }],
    },
    {
      code: `
        enum Fruit {
          Apple,
          Banana,
          Cherry,
        }
        const fruit = Fruit.Apple;
        1 === fruit;
      `,
      errors: [{ messageId: 'mismatched' }],
    },
    {
      code: `
        enum Vegetable {
          Asparagus = 'asparagus',
          Beet = 'beet',
          Celery = 'celery',
        }
        const vegetable = Vegetable.Asparagus;
        'beet' === vegetable;
      `,
      errors: [{ messageId: 'mismatched' }],
    },
    {
      code:
        'enum Fruit { Apple, Banana, Cherry }' +
        `enum Fruit2 {
  Apple2,
  Banana2,
  Cherry2,
}
      Fruit.Apple === Fruit2.Apple2;
        `,
      errors: [{ messageId: 'mismatched' }],
    },
    {
      code: `
        enum Vegetable {
          Asparagus = 'asparagus',
          Beet = 'beet',
          Celery = 'celery',
        }
        enum Vegetable2 {
          Asparagus2 = 'asparagus2',
          Beet2 = 'beet2',
          Celery2 = 'celery2',
        }
        Vegetable.Asparagus === Vegetable2.Asparagus2;
      `,
      errors: [{ messageId: 'mismatched' }],
    },
    {
      code:
        'enum Fruit { Apple, Banana, Cherry }' +
        `enum Fruit2 {
  Apple2,
  Banana2,
  Cherry2,
}
      const fruit = Fruit.Apple;
      fruit === Fruit2.Apple2;
        `,
      errors: [{ messageId: 'mismatched' }],
    },
    {
      code: `
        enum Vegetable {
          Asparagus = 'asparagus',
          Beet = 'beet',
          Celery = 'celery',
        }
        enum Vegetable2 {
          Asparagus2 = 'asparagus2',
          Beet2 = 'beet2',
          Celery2 = 'celery2',
        }
        const vegetable = Vegetable.Asparagus;
        vegetable === Vegetable2.Asparagus2;
      `,
      errors: [{ messageId: 'mismatched' }],
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
        { messageId: 'mismatched' },
        { messageId: 'mismatched' },
        { messageId: 'mismatched' },
        { messageId: 'mismatched' },
      ],
    },
    {
      code: `
        enum Fruit {
          Apple = 'apple',
        }
        type __String =
          | (string & { __escapedIdentifier: void })
          | (void & { __escapedIdentifier: void })
          | Fruit;
        declare const weirdString: __String;
        weirdString === 'someArbitraryValue';
      `,
      errors: [{ messageId: 'mismatched' }],
    },
  ],
});
