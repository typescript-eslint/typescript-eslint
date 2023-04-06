import rule from '../../src/rules/return-await';
import { getFixturesRootDir, noFormat, RuleTester } from '../RuleTester';

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
    'return;', // No function in scope, so behave like return in a commonjs module
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
            throw 'foo';
          } catch (e) {
            return Promise.resolve(1);
          }
        }
      `,
    },
    {
      options: ['in-try-catch'],
      code: `
        async function test() {
          try {
            throw 'foo';
          } catch (e) {
            throw 'foo2';
          } finally {
            return Promise.resolve(1);
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
    {
      code: `
        async function test() {
          const res = await Promise.resolve('{}');
          try {
            async function nested() {
              return Promise.resolve('ok');
            }
            return await nested();
          } catch (error) {
            return await Promise.resolve('error');
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
      code: `
const fn = (): any => null;
async function test() {
  return await fn();
}
      `,
      errors: [
        {
          line: 4,
          messageId: 'nonPromiseAwait',
          suggestions: [
            {
              messageId: 'nonPromiseAwait',
              output: `
const fn = (): any => null;
async function test() {
  return fn();
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
const fn = (): unknown => null;
async function test() {
  return await fn();
}
      `,
      errors: [
        {
          line: 4,
          messageId: 'nonPromiseAwait',
          suggestions: [
            {
              messageId: 'nonPromiseAwait',
              output: `
const fn = (): unknown => null;
async function test() {
  return fn();
}
      `,
            },
          ],
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
      code: `
async function foo() {}
async function bar() {}
async function baz() {}
async function qux() {}
async function buzz() {
  return (await foo()) ? bar() : baz();
}
      `,
      output: `
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
      output: `
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
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/2109
      code: `
async function test<T>(): Promise<T> {
  const res = await fetch('...');
  try {
    return res.json() as Promise<T>;
  } catch (err) {
    throw Error('Request Failed.');
  }
}
      `,
      output: `
async function test<T>(): Promise<T> {
  const res = await fetch('...');
  try {
    return await (res.json() as Promise<T>);
  } catch (err) {
    throw Error('Request Failed.');
  }
}
      `,
      errors: [
        {
          line: 5,
          messageId: 'requiredPromiseAwait',
        },
      ],
    },
    {
      code: `
        async function test() {
          try {
            const callback1 = function () {};
            const callback2 = async function () {};
            function callback3() {}
            async function callback4() {}
            const callback5 = () => {};
            const callback6 = async () => {};
            return Promise.resolve('try');
          } finally {
            return Promise.resolve('finally');
          }
        }
      `,
      output: `
        async function test() {
          try {
            const callback1 = function () {};
            const callback2 = async function () {};
            function callback3() {}
            async function callback4() {}
            const callback5 = () => {};
            const callback6 = async () => {};
            return await Promise.resolve('try');
          } finally {
            return Promise.resolve('finally');
          }
        }
      `,
      errors: [
        {
          line: 10,
          messageId: 'requiredPromiseAwait',
        },
      ],
    },
    {
      code: `
        async function bar() {}
        async function foo() {
          try {
            return undefined || bar();
          } catch {}
        }
      `,
      output: `
        async function bar() {}
        async function foo() {
          try {
            return await (undefined || bar());
          } catch {}
        }
      `,
      errors: [
        {
          line: 5,
          messageId: 'requiredPromiseAwait',
        },
      ],
    },
    {
      code: `
        async function bar() {}
        async function foo() {
          try {
            return bar() || undefined || bar();
          } catch {}
        }
      `,
      output: `
        async function bar() {}
        async function foo() {
          try {
            return await (bar() || undefined || bar());
          } catch {}
        }
      `,
      errors: [
        {
          line: 5,
          messageId: 'requiredPromiseAwait',
        },
      ],
    },
    {
      code: `
        async function bar() {}
        async function func1() {
          try {
            return null ?? bar();
          } catch {}
        }
        async function func2() {
          try {
            return 1 && bar();
          } catch {}
        }
        const foo = {
          bar: async function () {},
        };
        async function func3() {
          try {
            return foo.bar();
          } catch {}
        }
      `,
      output: `
        async function bar() {}
        async function func1() {
          try {
            return await (null ?? bar());
          } catch {}
        }
        async function func2() {
          try {
            return await (1 && bar());
          } catch {}
        }
        const foo = {
          bar: async function () {},
        };
        async function func3() {
          try {
            return await foo.bar();
          } catch {}
        }
      `,
      errors: [
        {
          line: 5,
          messageId: 'requiredPromiseAwait',
        },
        {
          line: 10,
          messageId: 'requiredPromiseAwait',
        },
        {
          line: 18,
          messageId: 'requiredPromiseAwait',
        },
      ],
    },
    {
      code: `
        class X {
          async bar() {
            return;
          }
          async func2() {
            try {
              return this.bar();
            } catch {}
          }
        }
      `,
      output: `
        class X {
          async bar() {
            return;
          }
          async func2() {
            try {
              return await this.bar();
            } catch {}
          }
        }
      `,
      errors: [
        {
          line: 8,
          messageId: 'requiredPromiseAwait',
        },
      ],
    },
  ],
});
