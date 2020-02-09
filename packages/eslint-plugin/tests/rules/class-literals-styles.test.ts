import rule from '../../src/rules/class-literals-style';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('class-literals-style', rule, {
  valid: [
    {
      code: 'class Mx { p1 = "hello world"; }',
      options: ['fields'],
    },
    {
      code: 'class Mx { static p1 = "hello world"; }',
      options: ['fields'],
    },
    {
      code: 'class Mx { readonly p1 = "hello world"; }',
      options: ['fields'],
    },
    {
      code: 'class Mx { p1: string; }',
      options: ['fields'],
    },
    {
      code: 'abstract class Mx { abstract get p1(): string }',
      options: ['fields'],
    },
    {
      code: `
        class Mx {
          get mySetting() {
            if(this._aValue) {
              return 'on';
            }

            return 'off';
          }
        }
      `,
      options: ['fields'],
    },
    {
      code: `
        class Mx {
          get mySetting() {
            return \`build-\${process.env.build}\`
          }
        }
      `,
      options: ['fields'],
    },
    {
      code: `
        class Mx {
          getMySetting() {
            if(this._aValue) {
              return 'on';
            }

            return 'off';
          }
        }
      `,
      options: ['fields'],
    },
    {
      code: 'class Mx { p1 = "hello world"; }',
      options: ['getters'],
    },
    {
      code: 'class Mx { p1: string; }',
      options: ['getters'],
    },
    {
      code: 'class Mx { readonly p1 = [1, 2, 3]; }',
      options: ['getters'],
    },
    {
      code: 'class Mx { static p1: string; }',
      options: ['getters'],
    },
    {
      code: 'class Mx { get p1() { return "hello world"; } }',
      options: ['getters'],
    },
    {
      code: 'class Mx { static get p1() { return "hello world"; } }',
      options: ['getters'],
    },
  ],
  invalid: [
    {
      code: 'class Mx { get p1() { return "hello world"; } }',
      output: 'class Mx { readonly p1="hello world" }',
      errors: [
        {
          messageId: 'preferFieldStyle',
        },
      ],
      options: ['fields'],
    },
    {
      code: 'class Mx { get p1() { return `hello world`; } }',
      output: 'class Mx { readonly p1=`hello world` }',
      errors: [
        {
          messageId: 'preferFieldStyle',
        },
      ],
      options: ['fields'],
    },
    {
      code: 'class Mx { static get p1() { return "hello world"; } }',
      output: 'class Mx { static readonly p1="hello world" }',
      errors: [
        {
          messageId: 'preferFieldStyle',
        },
      ],
      options: ['fields'],
    },
    {
      code: `
        class Mx {
          public get [myValue]() {
            return 'a literal value';
          }
        }
      `,
      output: `
        class Mx {
          public readonly [myValue]='a literal value'
        }
      `,
      errors: [
        {
          messageId: 'preferFieldStyle',
        },
      ],
      options: ['fields'],
    },
    {
      code: `
        class Mx {
          public get [myValue]() {
            return 12345n;
          }
        }
      `,
      output: `
        class Mx {
          public readonly [myValue]=12345n
        }
      `,
      errors: [
        {
          messageId: 'preferFieldStyle',
        },
      ],
      options: ['fields'],
    },
    {
      code: `
        class Mx {
          public readonly [myValue] = 'a literal value';
        }
      `,
      output: `
        class Mx {
          public get [myValue](){return 'a literal value'}
        }
      `,
      errors: [
        {
          messageId: 'preferGetterStyle',
        },
      ],
      options: ['getters'],
    },
    {
      code: 'class Mx { readonly p1 = "hello world"; }',
      output: 'class Mx { get p1(){return "hello world"} }',
      errors: [
        {
          messageId: 'preferGetterStyle',
        },
      ],
      options: ['getters'],
    },
    {
      code: 'class Mx { readonly p1 = `hello world`; }',
      output: 'class Mx { get p1(){return `hello world`} }',
      errors: [
        {
          messageId: 'preferGetterStyle',
        },
      ],
      options: ['getters'],
    },
    {
      code: 'class Mx { static readonly p1 = "hello world"; }',
      output: 'class Mx { static get p1(){return "hello world"} }',
      errors: [
        {
          messageId: 'preferGetterStyle',
        },
      ],
      options: ['getters'],
    },
    {
      code: 'class Mx { protected get p1() { return "hello world"; } }',
      output: 'class Mx { protected readonly p1="hello world" }',
      errors: [
        {
          messageId: 'preferFieldStyle',
        },
      ],
      options: ['fields'],
    },
    {
      code: 'class Mx { protected readonly p1 = "hello world"; }',
      output: 'class Mx { protected get p1(){return "hello world"} }',
      errors: [
        {
          messageId: 'preferGetterStyle',
        },
      ],
      options: ['getters'],
    },
    {
      code: 'class Mx { public static get p1() { return "hello world"; } }',
      output: 'class Mx { public static readonly p1="hello world" }',
      errors: [
        {
          messageId: 'preferFieldStyle',
        },
      ],
      options: ['fields'],
    },
    {
      code: 'class Mx { public static readonly p1 = "hello world"; }',
      output: 'class Mx { public static get p1(){return "hello world"} }',
      errors: [
        {
          messageId: 'preferGetterStyle',
        },
      ],
      options: ['getters'],
    },
  ],
});
