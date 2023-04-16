import rule from '../../src/rules/prefer-at';
import { getFixturesRootDir, RuleTester } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('prefer-at', rule, {
  valid: [
    `
      declare const str: string;

      const lastItem = str.at(-1);
    `,
    `
      declare const str: string;
      declare const i: number;

      const lastItem = str.at(-i);
    `,
    `
      declare const obj: Record<string, string>;

      const lastItem = obj.str.at(-1);
    `,
    `
      declare const obj: Record<string, string>;

      const lastItem = obj.str[obj.str2.length - 1];
    `,
    `
      declare const arr: Array<string>;

      const lastItem = arr[0].at(-1);
    `,
    `
      declare const arr: Array<string>;

      const lastItem = arr[0][arr[1].length - 1];
    `,
    `
      class A {
        str!: string;

        method() {
          return this.str.at(-1);
        }
      }
    `,
    `
      class A {
        str!: string;
        i!: number;

        method() {
          return this.str.at(-this.i);
        }
      }
    `,
    `
      class A {
        #str!: string;
        #i!: number;

        method() {
          return this.#str.at(-this.#i);
        }
      }
    `,
    `
      declare const getValue: () => string;

      const lastItem = getValue().at(-1);
    `,
    {
      code: `
        declare const getValue: () => string;

        const lastItem = getValue()[getValue().length - 1];
      `,
      options: [
        {
          ignoreFunctions: true,
        },
      ],
    },
    `
      class A {
        method() {
          return this.getValue().at(-1);
        }

        getValue(): string {
          return '';
        }
      }
    `,
    {
      code: `
        class A {
          method() {
            return this.getValue()[this.getValue().length - 1];
          }

          getValue(): string {
            return '';
          }
        }
      `,
      options: [
        {
          ignoreFunctions: true,
        },
      ],
    },
    `
      class A {
        values!: Array<() => string>;

        method() {
          return this.values[0]().at(-1);
        }
      }
    `,
    {
      code: `
        class A {
          values!: Array<() => string>;

          method() {
            return this.values[0]()[this.values[0]().length - 1];
          }
        }
      `,
      options: [
        {
          ignoreFunctions: true,
        },
      ],
    },
    `
      class A {
        #str!: string;

        #str2!: string;

        method() {
          const a = this.#str[this.#str2.length - 1];
        }
      }
    `,
    `
      class B {
        length!: number;
      }

      class A {
        b!: B;

        method() {
          const a = this.b[this.b.length - 1];
        }
      }
    `,
  ],
  invalid: [
    {
      code: `
        declare const str: string;

        const lastItem = str[str.length - 1];
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        declare const str: string;

        const lastItem = str.at(-1);
      `,
    },
    {
      code: `
        declare const str: string;

        const lastItem = str[str.length - 123];
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        declare const str: string;

        const lastItem = str.at(-123);
      `,
    },
    {
      code: `
        declare const str: string;
        declare const i: number;

        const lastItem = str[str.length - i];
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        declare const str: string;
        declare const i: number;

        const lastItem = str.at(-i);
      `,
    },
    {
      code: `
        declare const obj: Record<string, string>;

        const lastItem = obj.str[obj.str.length - 1];
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        declare const obj: Record<string, string>;

        const lastItem = obj.str.at(-1);
      `,
    },
    {
      code: `
        declare const arr: Array<string>;

        const lastItem = arr[0][arr[0].length - 1];
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        declare const arr: Array<string>;

        const lastItem = arr[0].at(-1);
      `,
    },
    {
      code: `
        class A {
          str!: string;

          method() {
            return this.str[this.str.length - 1];
          }
        }
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        class A {
          str!: string;

          method() {
            return this.str.at(-1);
          }
        }
      `,
    },
    {
      code: `
        class A {
          str!: string;
          i!: number;

          method() {
            return this.str[this.str.length - this.i];
          }
        }
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        class A {
          str!: string;
          i!: number;

          method() {
            return this.str.at(-this.i);
          }
        }
      `,
    },
    {
      code: `
        class A {
          #str!: string;
          #i!: number;

          method() {
            return this.#str[this.#str.length - this.#i];
          }
        }
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        class A {
          #str!: string;
          #i!: number;

          method() {
            return this.#str.at(-this.#i);
          }
        }
      `,
    },
    {
      code: `
        declare const getValue: () => string;

        const lastItem = getValue()[getValue().length - 1];
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        declare const getValue: () => string;

        const lastItem = getValue().at(-1);
      `,
    },
    {
      code: `
        class A {
          method() {
            return this.getValue()[this.getValue().length - 1];
          }

          getValue(): string {
            return '';
          }
        }
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        class A {
          method() {
            return this.getValue().at(-1);
          }

          getValue(): string {
            return '';
          }
        }
      `,
    },
    {
      code: `
        class A {
          #str!: string;

          method() {
            const a = this.#str[this.#str.length - 1];
          }
        }
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        class A {
          #str!: string;

          method() {
            const a = this.#str.at(-1);
          }
        }
      `,
    },
    {
      code: `
        class A {
          #arr!: Array<string>;

          method() {
            const a = this.#arr[0][this.#arr[0].length - 1];
          }
        }
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        class A {
          #arr!: Array<string>;

          method() {
            const a = this.#arr[0].at(-1);
          }
        }
      `,
    },
    {
      code: `
        class A {
          values!: Array<() => string>;

          method() {
            return this.values[0]()[this.values[0]().length - 1];
          }
        }
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        class A {
          values!: Array<() => string>;

          method() {
            return this.values[0]().at(-1);
          }
        }
      `,
    },
    {
      code: `
        class A {
          #obj!: Record<string, Array<Record<string, string>>>;

          method() {
            const a = this.#obj.test[0].str[this.#obj.test[0].str.length - 1];
          }
        }
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        class A {
          #obj!: Record<string, Array<Record<string, string>>>;

          method() {
            const a = this.#obj.test[0].str.at(-1);
          }
        }
      `,
    },
    {
      code: `
        declare const str: String;

        const lastItem = str[str.length - 1];
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        declare const str: String;

        const lastItem = str.at(-1);
      `,
    },
    {
      code: `
        declare const arr: Array<string>;

        const lastItem = arr[arr.length - 1];
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        declare const arr: Array<string>;

        const lastItem = arr.at(-1);
      `,
    },
    {
      code: `
        declare const arr: Int8Array;

        const lastItem = arr[arr.length - 1];
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        declare const arr: Int8Array;

        const lastItem = arr.at(-1);
      `,
    },
    {
      code: `
        declare const arr: Uint8Array;

        const lastItem = arr[arr.length - 1];
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        declare const arr: Uint8Array;

        const lastItem = arr.at(-1);
      `,
    },
    {
      code: `
        declare const arr: Uint8ClampedArray;

        const lastItem = arr[arr.length - 1];
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        declare const arr: Uint8ClampedArray;

        const lastItem = arr.at(-1);
      `,
    },
    {
      code: `
        declare const arr: Int16Array;

        const lastItem = arr[arr.length - 1];
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        declare const arr: Int16Array;

        const lastItem = arr.at(-1);
      `,
    },
    {
      code: `
        declare const arr: Uint16Array;

        const lastItem = arr[arr.length - 1];
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        declare const arr: Uint16Array;

        const lastItem = arr.at(-1);
      `,
    },
    {
      code: `
        declare const arr: Int32Array;

        const lastItem = arr[arr.length - 1];
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        declare const arr: Int32Array;

        const lastItem = arr.at(-1);
      `,
    },
    {
      code: `
        declare const arr: Float32Array;

        const lastItem = arr[arr.length - 1];
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        declare const arr: Float32Array;

        const lastItem = arr.at(-1);
      `,
    },
    {
      code: `
        declare const arr: Uint32Array;

        const lastItem = arr[arr.length - 1];
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        declare const arr: Uint32Array;

        const lastItem = arr.at(-1);
      `,
    },
    {
      code: `
        declare const arr: Float64Array;

        const lastItem = arr[arr.length - 1];
      `,
      errors: [
        {
          messageId: 'preferAt',
        },
      ],
      output: `
        declare const arr: Float64Array;

        const lastItem = arr.at(-1);
      `,
    },
  ],
});
