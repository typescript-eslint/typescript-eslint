import rule from '../../src/rules/return-await';
import { getFixturesRootDir, RuleTester, noFormat } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

// default rule is in-try-catch
ruleTester.run('return-await', rule, {
  valid: [
    `
      function test() {
        return;
      }
    `,
    `
      function test() {
        return 1;
      }
    `,
    `
      async function test() {
        return;
      }
    `,
    `
      async function test() {
        return 1;
      }
    `,
    'const test = () => 1;',
    'const test = async () => 1;',
    `
      async function test() {
        return Promise.resolve(1);
      }
    `,
    `
      async function test() {
        try {
          return await Promise.resolve(1);
        } catch (e) {
          return await Promise.resolve(2);
        } finally {
          console.log('cleanup');
        }
      }
    `,
    `
      async function test() {
        try {
          const one = await Promise.resolve(1);
          return one;
        } catch (e) {
          const two = await Promise.resolve(2);
          return two;
        } finally {
          console.log('cleanup');
        }
      }
    `,
    {
      options: ['in-try-catch'],
      code: `
        function test() {
          return 1;
        }
      `,
    },
    {
      options: ['in-try-catch'],
      code: `
        async function test() {
          return 1;
        }
      `,
    },
    {
      options: ['in-try-catch'],
      code: 'const test = () => 1;',
    },
    {
      options: ['in-try-catch'],
      code: 'const test = async () => 1;',
    },
    {
      options: ['in-try-catch'],
      code: `
        async function test() {
          return Promise.resolve(1);
        }
      `,
    },
    {
      options: ['in-try-catch'],
      code: `
        async function test() {
          try {
            return await Promise.resolve(1);
          } catch (e) {
            return await Promise.resolve(2);
          } finally {
            console.log('cleanup');
          }
        }
      `,
    },
    {
      options: ['in-try-catch'],
      code: `
        async function test() {
          try {
            const one = await Promise.resolve(1);
            return one;
          } catch (e) {
            const two = await Promise.resolve(2);
            return two;
          } finally {
            console.log('cleanup');
          }
        }
      `,
    },
    {
      options: ['never'],
      code: `
        async function test() {
          return Promise.resolve(1);
        }
      `,
    },
    {
      options: ['never'],
      code: 'const test = async () => Promise.resolve(1);',
    },
    {
      options: ['never'],
      code: `
        async function test() {
          try {
            return Promise.resolve(1);
          } catch (e) {
            return Promise.resolve(2);
          } finally {
            console.log('cleanup');
          }
        }
      `,
    },
    {
      options: ['always'],
      code: `
        async function test() {
          return await Promise.resolve(1);
        }
      `,
    },
    {
      options: ['always'],
      code: 'const test = async () => await Promise.resolve(1);',
    },
    {
      options: ['always'],
      code: `
        async function test() {
          try {
            return await Promise.resolve(1);
          } catch (e) {
            return await Promise.resolve(2);
          } finally {
            console.log('cleanup');
          }
        }
      `,
    },
    {
      options: ['always'],
      code: `
        declare function foo(): Promise<boolean>;

        function bar(baz: boolean): Promise<boolean> | boolean {
          if (baz) {
            return true;
          } else {
            return foo();
          }
        }
      `,
    },
    {
      code: `
        async function test(): Promise<string> {
          const res = await Promise.resolve('{}');
          try {
            return JSON.parse(res);
          } catch (error) {
            return res;
          }
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        async function test() {
          return await 1;
        }
      `,
      output: `
        async function test() {
          return 1;
        }
      `,
      errors: [
        {
          line: 3,
          messageId: 'nonPromiseAwait',
        },
      ],
    },
    {
      code: `
        async function test() {
          const foo = 1;
          return await { foo };
        }
      `,
      output: `
        async function test() {
          const foo = 1;
          return { foo };
        }
      `,
      errors: [
        {
          line: 4,
          messageId: 'nonPromiseAwait',
        },
      ],
    },
    {
      code: `
        async function test() {
          const foo = 1;
          return await foo;
        }
      `,
      output: `
        async function test() {
          const foo = 1;
          return foo;
        }
      `,
      errors: [
        {
          line: 4,
          messageId: 'nonPromiseAwait',
        },
      ],
    },
    {
      code: 'const test = async () => await 1;',
      output: 'const test = async () => 1;',
      errors: [
        {
          line: 1,
          messageId: 'nonPromiseAwait',
        },
      ],
    },
    {
      code: 'const test = async () => await /* comment */ 1;',
      output: 'const test = async () => /* comment */ 1;',
      errors: [
        {
          line: 1,
          messageId: 'nonPromiseAwait',
        },
      ],
    },
    {
      code: 'const test = async () => await Promise.resolve(1);',
      output: 'const test = async () => Promise.resolve(1);',
      errors: [
        {
          line: 1,
          messageId: 'disallowedPromiseAwait',
        },
      ],
    },
    {
      code: `
        async function test() {
          try {
            return Promise.resolve(1);
          } catch (e) {
            return Promise.resolve(2);
          } finally {
            console.log('cleanup');
          }
        }
      `,
      output: `
        async function test() {
          try {
            return await Promise.resolve(1);
          } catch (e) {
            return await Promise.resolve(2);
          } finally {
            console.log('cleanup');
          }
        }
      `,
      errors: [
        {
          line: 4,
          messageId: 'requiredPromiseAwait',
        },
        {
          line: 6,
          messageId: 'requiredPromiseAwait',
        },
      ],
    },
    {
      code: `
        async function test() {
          return await Promise.resolve(1);
        }
      `,
      output: `
        async function test() {
          return Promise.resolve(1);
        }
      `,
      errors: [
        {
          line: 3,
          messageId: 'disallowedPromiseAwait',
        },
      ],
    },
    {
      options: ['in-try-catch'],
      code: `
        async function test() {
          return await 1;
        }
      `,
      output: `
        async function test() {
          return 1;
        }
      `,
      errors: [
        {
          line: 3,
          messageId: 'nonPromiseAwait',
        },
      ],
    },
    {
      options: ['in-try-catch'],
      code: 'const test = async () => await 1;',
      output: 'const test = async () => 1;',
      errors: [
        {
          line: 1,
          messageId: 'nonPromiseAwait',
        },
      ],
    },
    {
      options: ['in-try-catch'],
      code: 'const test = async () => await Promise.resolve(1);',
      output: 'const test = async () => Promise.resolve(1);',
      errors: [
        {
          line: 1,
          messageId: 'disallowedPromiseAwait',
        },
      ],
    },
    {
      options: ['in-try-catch'],
      code: `
        async function test() {
          try {
            return Promise.resolve(1);
          } catch (e) {
            return Promise.resolve(2);
          } finally {
            console.log('cleanup');
          }
        }
      `,
      output: `
        async function test() {
          try {
            return await Promise.resolve(1);
          } catch (e) {
            return await Promise.resolve(2);
          } finally {
            console.log('cleanup');
          }
        }
      `,
      errors: [
        {
          line: 4,
          messageId: 'requiredPromiseAwait',
        },
        {
          line: 6,
          messageId: 'requiredPromiseAwait',
        },
      ],
    },
    {
      options: ['in-try-catch'],
      code: `
        async function test() {
          try {
            throw 'foo';
          } catch (e) {
            return Promise.resolve(1);
          }
        }
      `,
      output: `
        async function test() {
          try {
            throw 'foo';
          } catch (e) {
            return await Promise.resolve(1);
          }
        }
      `,
      errors: [
        {
          line: 6,
          messageId: 'requiredPromiseAwait',
        },
      ],
    },
    {
      options: ['in-try-catch'],
      code: `
        async function test() {
          return await Promise.resolve(1);
        }
      `,
      output: `
        async function test() {
          return Promise.resolve(1);
        }
      `,
      errors: [
        {
          line: 3,
          messageId: 'disallowedPromiseAwait',
        },
      ],
    },
    {
      options: ['never'],
      code: `
        async function test() {
          return await 1;
        }
      `,
      output: `
        async function test() {
          return 1;
        }
      `,
      errors: [
        {
          line: 3,
          messageId: 'nonPromiseAwait',
        },
      ],
    },
    {
      options: ['never'],
      code: `
        async function test() {
          try {
            return await Promise.resolve(1);
          } catch (e) {
            return await Promise.resolve(2);
          } finally {
            console.log('cleanup');
          }
        }
      `,
      output: `
        async function test() {
          try {
            return Promise.resolve(1);
          } catch (e) {
            return Promise.resolve(2);
          } finally {
            console.log('cleanup');
          }
        }
      `,
      errors: [
        {
          line: 4,
          messageId: 'disallowedPromiseAwait',
        },
        {
          line: 6,
          messageId: 'disallowedPromiseAwait',
        },
      ],
    },
    {
      options: ['never'],
      code: `
        async function test() {
          return await Promise.resolve(1);
        }
      `,
      output: `
        async function test() {
          return Promise.resolve(1);
        }
      `,
      errors: [
        {
          line: 3,
          messageId: 'disallowedPromiseAwait',
        },
      ],
    },
    {
      options: ['always'],
      code: `
        async function test() {
          return await 1;
        }
      `,
      output: `
        async function test() {
          return 1;
        }
      `,
      errors: [
        {
          line: 3,
          messageId: 'nonPromiseAwait',
        },
      ],
    },
    {
      options: ['always'],
      code: `
        async function test() {
          try {
            return Promise.resolve(1);
          } catch (e) {
            return Promise.resolve(2);
          } finally {
            console.log('cleanup');
          }
        }
      `,
      output: `
        async function test() {
          try {
            return await Promise.resolve(1);
          } catch (e) {
            return await Promise.resolve(2);
          } finally {
            console.log('cleanup');
          }
        }
      `,
      errors: [
        {
          line: 4,
          messageId: 'requiredPromiseAwait',
        },
        {
          line: 6,
          messageId: 'requiredPromiseAwait',
        },
      ],
    },
    {
      options: ['always'],
      code: `
        async function test() {
          return Promise.resolve(1);
        }
      `,
      output: `
        async function test() {
          return await Promise.resolve(1);
        }
      `,
      errors: [
        {
          line: 3,
          messageId: 'requiredPromiseAwait',
        },
      ],
    },
    {
      options: ['always'],
      code: 'const test = async () => Promise.resolve(1);',
      output: 'const test = async () => await Promise.resolve(1);',
      errors: [
        {
          line: 1,
          messageId: 'requiredPromiseAwait',
        },
      ],
    },
    {
      options: ['always'],
      code: noFormat`
async function foo() {}
async function bar() {}
async function baz() {}
async function qux() {}
async function buzz() {
  return (await foo()) ? bar() : baz();
}
      `,
      output: noFormat`
async function foo() {}
async function bar() {}
async function baz() {}
async function qux() {}
async function buzz() {
  return (await foo()) ? await bar() : await baz();
}
      `,
      errors: [
        {
          line: 7,
          messageId: 'requiredPromiseAwait',
        },
        {
          line: 7,
          messageId: 'requiredPromiseAwait',
        },
      ],
    },
    {
      options: ['always'],
      code: noFormat`
async function foo() {}
async function bar() {}
async function baz() {}
async function qux() {}
async function buzz() {
  return (await foo())
    ? (
      bar ? bar() : baz()
    ) : baz ? baz() : bar();
}
      `,
      output: noFormat`
async function foo() {}
async function bar() {}
async function baz() {}
async function qux() {}
async function buzz() {
  return (await foo())
    ? (
      bar ? await bar() : await baz()
    ) : baz ? await baz() : await bar();
}
      `,
      errors: [
        {
          line: 9,
          messageId: 'requiredPromiseAwait',
        },
        {
          line: 9,
          messageId: 'requiredPromiseAwait',
        },
        {
          line: 10,
          messageId: 'requiredPromiseAwait',
        },
        {
          line: 10,
          messageId: 'requiredPromiseAwait',
        },
      ],
    },
    {
      options: ['always'],
      code: `
async function foo() {}
async function bar() {}
async function buzz() {
  return (await foo()) ? await 1 : bar();
}
      `,
      output: `
async function foo() {}
async function bar() {}
async function buzz() {
  return (await foo()) ? 1 : await bar();
}
      `,
      errors: [
        {
          line: 5,
          messageId: 'nonPromiseAwait',
        },
        {
          line: 5,
          messageId: 'requiredPromiseAwait',
        },
      ],
    },
    {
      options: ['always'],
      code: `
async function foo() {}
async function bar() {}
async function baz() {}
const buzz = async () => ((await foo()) ? bar() : baz());
      `,
      output: `
async function foo() {}
async function bar() {}
async function baz() {}
const buzz = async () => ((await foo()) ? await bar() : await baz());
      `,
      errors: [
        {
          line: 5,
          messageId: 'requiredPromiseAwait',
        },
        {
          line: 5,
          messageId: 'requiredPromiseAwait',
        },
      ],
    },
    {
      options: ['always'],
      code: `
async function foo() {}
async function bar() {}
const buzz = async () => ((await foo()) ? await 1 : bar());
      `,
      output: `
async function foo() {}
async function bar() {}
const buzz = async () => ((await foo()) ? 1 : await bar());
      `,
      errors: [
        {
          line: 4,
          messageId: 'nonPromiseAwait',
        },
        {
          line: 4,
          messageId: 'requiredPromiseAwait',
        },
      ],
    },
  ],
});
