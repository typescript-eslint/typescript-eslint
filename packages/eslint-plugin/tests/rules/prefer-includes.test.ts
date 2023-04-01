import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/prefer-includes';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('prefer-includes', rule, {
  valid: [
    `
      function f(a: string): void {
        a.indexOf(b);
      }
    `,
    `
      function f(a: string): void {
        a.indexOf(b) + 0;
      }
    `,
    `
      function f(a: string | { value: string }): void {
        a.indexOf(b) !== -1;
      }
    `,
    `
      type UserDefined = {
        indexOf(x: any): number; // don't have 'includes'
      };
      function f(a: UserDefined): void {
        a.indexOf(b) !== -1;
      }
    `,
    `
      type UserDefined = {
        indexOf(x: any, fromIndex?: number): number;
        includes(x: any): boolean; // different parameters
      };
      function f(a: UserDefined): void {
        a.indexOf(b) !== -1;
      }
    `,
    `
      type UserDefined = {
        indexOf(x: any, fromIndex?: number): number;
        includes(x: any, fromIndex: number): boolean; // different parameters
      };
      function f(a: UserDefined): void {
        a.indexOf(b) !== -1;
      }
    `,
    `
      type UserDefined = {
        indexOf(x: any, fromIndex?: number): number;
        includes: boolean; // different type
      };
      function f(a: UserDefined): void {
        a.indexOf(b) !== -1;
      }
    `,
    `
      function f(a: string): void {
        /bar/i.test(a);
      }
    `,
    `
      function f(a: string): void {
        /ba[rz]/.test(a);
      }
    `,
    `
      function f(a: string): void {
        /foo|bar/.test(a);
      }
    `,
    `
      function f(a: string): void {
        /bar/.test();
      }
    `,
    `
      function f(a: string): void {
        something.test(a);
      }
    `,
    `
      const pattern = new RegExp('bar');
      function f(a) {
        return pattern.test(a);
      }
    `,
  ],
  invalid: [
    // positive
    {
      code: `
        function f(a: string): void {
          a.indexOf(b) !== -1;
        }
      `,
      output: `
        function f(a: string): void {
          a.includes(b);
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },
    {
      code: `
        function f(a: string): void {
          a.indexOf(b) != -1;
        }
      `,
      output: `
        function f(a: string): void {
          a.includes(b);
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },
    {
      code: `
        function f(a: string): void {
          a.indexOf(b) > -1;
        }
      `,
      output: `
        function f(a: string): void {
          a.includes(b);
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },
    {
      code: `
        function f(a: string): void {
          a.indexOf(b) >= 0;
        }
      `,
      output: `
        function f(a: string): void {
          a.includes(b);
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },

    // negative
    {
      code: `
        function f(a: string): void {
          a.indexOf(b) === -1;
        }
      `,
      output: `
        function f(a: string): void {
          !a.includes(b);
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },
    {
      code: `
        function f(a: string): void {
          a.indexOf(b) == -1;
        }
      `,
      output: `
        function f(a: string): void {
          !a.includes(b);
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },
    {
      code: `
        function f(a: string): void {
          a.indexOf(b) <= -1;
        }
      `,
      output: `
        function f(a: string): void {
          !a.includes(b);
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },
    {
      code: `
        function f(a: string): void {
          a.indexOf(b) < 0;
        }
      `,
      output: `
        function f(a: string): void {
          !a.includes(b);
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },
    {
      code: `
        function f(a?: string): void {
          a?.indexOf(b) === -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },
    {
      code: `
        function f(a?: string): void {
          a?.indexOf(b) !== -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },

    // RegExp#test
    {
      code: `
        function f(a: string): void {
          /bar/.test(a);
        }
      `,
      output: `
        function f(a: string): void {
          a.includes('bar');
        }
      `,
      errors: [{ messageId: 'preferStringIncludes' }],
    },
    {
      code: `
        const pattern = new RegExp('bar');
        function f(a: string): void {
          pattern.test(a);
        }
      `,
      output: `
        const pattern = new RegExp('bar');
        function f(a: string): void {
          a.includes('bar');
        }
      `,
      errors: [{ messageId: 'preferStringIncludes' }],
    },
    {
      code: `
        const pattern = /bar/;
        function f(a: string, b: string): void {
          pattern.test(a + b);
        }
      `,
      output: `
        const pattern = /bar/;
        function f(a: string, b: string): void {
          (a + b).includes('bar');
        }
      `,
      errors: [{ messageId: 'preferStringIncludes' }],
    },

    // type variation
    {
      code: `
        function f(a: any[]): void {
          a.indexOf(b) !== -1;
        }
      `,
      output: `
        function f(a: any[]): void {
          a.includes(b);
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },
    {
      code: `
        function f(a: ReadonlyArray<any>): void {
          a.indexOf(b) !== -1;
        }
      `,
      output: `
        function f(a: ReadonlyArray<any>): void {
          a.includes(b);
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },
    {
      code: `
        function f(a: Int8Array): void {
          a.indexOf(b) !== -1;
        }
      `,
      output: `
        function f(a: Int8Array): void {
          a.includes(b);
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },
    {
      code: `
        function f(a: Int16Array): void {
          a.indexOf(b) !== -1;
        }
      `,
      output: `
        function f(a: Int16Array): void {
          a.includes(b);
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },
    {
      code: `
        function f(a: Int32Array): void {
          a.indexOf(b) !== -1;
        }
      `,
      output: `
        function f(a: Int32Array): void {
          a.includes(b);
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },
    {
      code: `
        function f(a: Uint8Array): void {
          a.indexOf(b) !== -1;
        }
      `,
      output: `
        function f(a: Uint8Array): void {
          a.includes(b);
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },
    {
      code: `
        function f(a: Uint16Array): void {
          a.indexOf(b) !== -1;
        }
      `,
      output: `
        function f(a: Uint16Array): void {
          a.includes(b);
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },
    {
      code: `
        function f(a: Uint32Array): void {
          a.indexOf(b) !== -1;
        }
      `,
      output: `
        function f(a: Uint32Array): void {
          a.includes(b);
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },
    {
      code: `
        function f(a: Float32Array): void {
          a.indexOf(b) !== -1;
        }
      `,
      output: `
        function f(a: Float32Array): void {
          a.includes(b);
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },
    {
      code: `
        function f(a: Float64Array): void {
          a.indexOf(b) !== -1;
        }
      `,
      output: `
        function f(a: Float64Array): void {
          a.includes(b);
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },
    {
      code: `
        function f<T>(a: T[] | ReadonlyArray<T>): void {
          a.indexOf(b) !== -1;
        }
      `,
      output: `
        function f<T>(a: T[] | ReadonlyArray<T>): void {
          a.includes(b);
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },
    {
      code: `
        function f<
          T,
          U extends
            | T[]
            | ReadonlyArray<T>
            | Int8Array
            | Uint8Array
            | Int16Array
            | Uint16Array
            | Int32Array
            | Uint32Array
            | Float32Array
            | Float64Array,
        >(a: U): void {
          a.indexOf(b) !== -1;
        }
      `,
      output: `
        function f<
          T,
          U extends
            | T[]
            | ReadonlyArray<T>
            | Int8Array
            | Uint8Array
            | Int16Array
            | Uint16Array
            | Int32Array
            | Uint32Array
            | Float32Array
            | Float64Array,
        >(a: U): void {
          a.includes(b);
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },
    {
      code: `
        type UserDefined = {
          indexOf(x: any): number;
          includes(x: any): boolean;
        };
        function f(a: UserDefined): void {
          a.indexOf(b) !== -1;
        }
      `,
      output: `
        type UserDefined = {
          indexOf(x: any): number;
          includes(x: any): boolean;
        };
        function f(a: UserDefined): void {
          a.includes(b);
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },
    {
      code: `
        function f(a: Readonly<any[]>): void {
          a.indexOf(b) !== -1;
        }
      `,
      output: `
        function f(a: Readonly<any[]>): void {
          a.includes(b);
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
    },
  ],
});
