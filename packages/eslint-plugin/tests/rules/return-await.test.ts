import type { InvalidTestCase } from '@typescript-eslint/rule-tester';

import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/return-await';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootDir,
    },
  },
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
const fn = (): any => null;
async function test() {
  return await fn();
}
    `,
    `
const fn = (): unknown => null;
async function test() {
  return await fn();
}
    `,
    `
async function test(unknownParam: unknown) {
  try {
    return await unknownParam;
  } finally {
    console.log('In finally block');
  }
}
    `,
    {
      code: `
        async function test() {
          if (Math.random() < 0.33) {
            return await Promise.resolve(1);
          } else if (Math.random() < 0.5) {
            return Promise.resolve(2);
          }

          try {
          } catch (e) {
            return await Promise.resolve(3);
          } finally {
            console.log('cleanup');
          }
        }
      `,
      options: ['error-handling-correctness-only'],
    },
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
      code: `
        function test() {
          return 1;
        }
      `,
      options: ['in-try-catch'],
    },
    {
      code: `
        async function test() {
          return 1;
        }
      `,
      options: ['in-try-catch'],
    },
    {
      code: 'const test = () => 1;',
      options: ['in-try-catch'],
    },
    {
      code: 'const test = async () => 1;',
      options: ['in-try-catch'],
    },
    {
      code: `
        async function test() {
          return Promise.resolve(1);
        }
      `,
      options: ['in-try-catch'],
    },
    {
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
      options: ['in-try-catch'],
    },
    {
      code: `
        async function test() {
          try {
            throw 'foo';
          } catch (e) {
            return Promise.resolve(1);
          }
        }
      `,
      options: ['in-try-catch'],
    },
    {
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
      options: ['in-try-catch'],
    },
    {
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
      options: ['in-try-catch'],
    },
    {
      code: `
        async function test() {
          return Promise.resolve(1);
        }
      `,
      options: ['never'],
    },
    {
      code: 'const test = async () => Promise.resolve(1);',
      options: ['never'],
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
      options: ['never'],
    },
    {
      code: `
        async function test() {
          return await Promise.resolve(1);
        }
      `,
      options: ['always'],
    },
    {
      code: 'const test = async () => await Promise.resolve(1);',
      options: ['always'],
    },
    {
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
      options: ['always'],
    },
    {
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
      options: ['always'],
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
    // https://github.com/typescript-eslint/typescript-eslint/issues/8663
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
            return Promise.resolve('error');
          }
        }
      `,
    },
    {
      code: `
async function f() {
  try {
  } catch {
    try {
    } catch {
      return Promise.reject();
    }
  }
}
      `,
    },
    {
      code: `
async function f() {
  try {
  } finally {
    try {
    } catch {
      return Promise.reject();
    }
  }
}
      `,
    },
    {
      code: `
async function f() {
  try {
  } finally {
    try {
    } finally {
      try {
      } catch {
        return Promise.reject();
      }
    }
  }
}
      `,
    },
    {
      code: `
declare const bleh: any;
async function f() {
  using something = bleh;
  return await Promise.resolve(2);
}
      `,
    },
    {
      code: `
declare const bleh: any;
async function f() {
  await using something = bleh;
  return await Promise.resolve(2);
}
      `,
    },
    {
      code: `
declare const bleh: any;
async function f() {
  using something = bleh;
  {
    return await Promise.resolve(2);
  }
}
      `,
    },
    {
      code: `
declare const bleh: any;
async function f() {
  return Promise.resolve(2);
  using something = bleh;
}
      `,
    },
    {
      code: `
declare const bleh: any;
async function f() {
  return await Promise.resolve(2);
  using something = bleh;
}
      `,
      options: ['always'],
    },
    {
      code: `
declare function asyncFn(): Promise<unknown>;
async function returnAwait() {
  using _ = {
    [Symbol.dispose]: () => {
      console.log('dispose');
    },
  };

  return await asyncFn();
}
      `,
      options: ['in-try-catch'],
    },
    {
      code: `
declare function asyncFn(): Promise<unknown>;
async function outerFunction() {
  using _ = {
    [Symbol.dispose]: () => {
      console.log('dispose');
    },
  };

  async function innerFunction() {
    return asyncFn();
  }
}
      `,
      options: ['in-try-catch'],
    },
    {
      code: `
declare function asyncFn(): Promise<unknown>;
async function outerFunction() {
  using _ = {
    [Symbol.dispose]: () => {
      console.log('dispose');
    },
  };

  const innerFunction = async () => asyncFn();
}
      `,
      options: ['in-try-catch'],
    },
    {
      // intentionally invalid AST - return is outside a function.
      // We just want to be sure this doesn't crash.
      code: `
using foo = 1 as any;
return Promise.resolve(42);
      `,
    },
    {
      // intentionally invalid AST - return is outside a function.
      // We just want to be sure this doesn't crash.
      code: `
{
  using foo = 1 as any;
  return Promise.resolve(42);
}
      `,
    },
    {
      code: `
async function wrapper<T>(value: T) {
  return await value;
}
      `,
    },
    {
      code: `
async function wrapper<T extends unknown>(value: T) {
  return await value;
}
      `,
    },
    {
      code: `
async function wrapper<T extends any>(value: T) {
  return await value;
}
      `,
    },
    {
      code: `
class C<T> {
  async wrapper<T>(value: T) {
    return await value;
  }
}
      `,
    },
    {
      code: `
class C<R> {
  async wrapper<T extends R>(value: T) {
    return await value;
  }
}
      `,
    },
    {
      code: `
class C<R extends unknown> {
  async wrapper<T extends R>(value: T) {
    return await value;
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
      errors: [
        {
          line: 3,
          messageId: 'nonPromiseAwait',
        },
      ],
      output: `
        async function test() {
          return 1;
        }
      `,
    },
    {
      code: `
        async function test() {
          const foo = 1;
          return await { foo };
        }
      `,
      errors: [
        {
          line: 4,
          messageId: 'nonPromiseAwait',
        },
      ],
      output: `
        async function test() {
          const foo = 1;
          return { foo };
        }
      `,
    },
    {
      code: `
        async function test() {
          const foo = 1;
          return await foo;
        }
      `,
      errors: [
        {
          line: 4,
          messageId: 'nonPromiseAwait',
        },
      ],
      output: `
        async function test() {
          const foo = 1;
          return foo;
        }
      `,
    },
    {
      code: 'const test = async () => await 1;',
      errors: [
        {
          line: 1,
          messageId: 'nonPromiseAwait',
        },
      ],
      output: 'const test = async () => 1;',
    },
    {
      code: 'const test = async () => await /* comment */ 1;',
      errors: [
        {
          line: 1,
          messageId: 'nonPromiseAwait',
        },
      ],
      output: 'const test = async () => /* comment */ 1;',
    },
    {
      code: 'const test = async () => await Promise.resolve(1);',
      errors: [
        {
          line: 1,
          messageId: 'disallowedPromiseAwait',
        },
      ],
      output: 'const test = async () => Promise.resolve(1);',
    },

    ...['error-handling-correctness-only', 'always', 'in-try-catch'].map(
      option =>
        ({
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
          errors: [
            {
              line: 4,
              messageId: 'requiredPromiseAwait',
              suggestions: [
                {
                  messageId: 'requiredPromiseAwaitSuggestion',
                  output: `
        async function test() {
          try {
            return await Promise.resolve(1);
          } catch (e) {
            return Promise.resolve(2);
          } finally {
            console.log('cleanup');
          }
        }
      `,
                },
              ],
            },
            {
              line: 6,
              messageId: 'requiredPromiseAwait',
              suggestions: [
                {
                  messageId: 'requiredPromiseAwaitSuggestion',
                  output: `
        async function test() {
          try {
            return Promise.resolve(1);
          } catch (e) {
            return await Promise.resolve(2);
          } finally {
            console.log('cleanup');
          }
        }
      `,
                },
              ],
            },
          ],
          options: [option],
          output: null,
        }) satisfies InvalidTestCase<
          'requiredPromiseAwait' | 'requiredPromiseAwaitSuggestion',
          [string]
        >,
    ),

    {
      code: `
        async function test() {
          return await Promise.resolve(1);
        }
      `,
      errors: [
        {
          line: 3,
          messageId: 'disallowedPromiseAwait',
        },
      ],
      output: `
        async function test() {
          return Promise.resolve(1);
        }
      `,
    },
    {
      code: `
        async function test() {
          return await 1;
        }
      `,
      errors: [
        {
          line: 3,
          messageId: 'nonPromiseAwait',
        },
      ],
      options: ['in-try-catch'],
      output: `
        async function test() {
          return 1;
        }
      `,
    },
    {
      code: 'const test = async () => await 1;',
      errors: [
        {
          line: 1,
          messageId: 'nonPromiseAwait',
        },
      ],
      options: ['in-try-catch'],
      output: 'const test = async () => 1;',
    },
    {
      code: 'const test = async () => await Promise.resolve(1);',
      errors: [
        {
          line: 1,
          messageId: 'disallowedPromiseAwait',
        },
      ],
      options: ['in-try-catch'],
      output: 'const test = async () => Promise.resolve(1);',
    },
    {
      code: `
        async function test() {
          return await Promise.resolve(1);
        }
      `,
      errors: [
        {
          line: 3,
          messageId: 'disallowedPromiseAwait',
        },
      ],
      options: ['in-try-catch'],
      output: `
        async function test() {
          return Promise.resolve(1);
        }
      `,
    },
    {
      code: `
        async function test() {
          return await 1;
        }
      `,
      errors: [
        {
          line: 3,
          messageId: 'nonPromiseAwait',
        },
      ],
      options: ['never'],
      output: `
        async function test() {
          return 1;
        }
      `,
    },
    {
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
      errors: [
        {
          line: 4,
          messageId: 'disallowedPromiseAwait',
          suggestions: [
            {
              messageId: 'disallowedPromiseAwaitSuggestion',
              output: `
        async function test() {
          try {
            return Promise.resolve(1);
          } catch (e) {
            return await Promise.resolve(2);
          } finally {
            console.log('cleanup');
          }
        }
      `,
            },
          ],
        },
        {
          line: 6,
          messageId: 'disallowedPromiseAwait',
          suggestions: [
            {
              messageId: 'disallowedPromiseAwaitSuggestion',
              output: `
        async function test() {
          try {
            return await Promise.resolve(1);
          } catch (e) {
            return Promise.resolve(2);
          } finally {
            console.log('cleanup');
          }
        }
      `,
            },
          ],
        },
      ],
      options: ['never'],
      output: null,
    },
    {
      code: `
        async function test() {
          return await Promise.resolve(1);
        }
      `,
      errors: [
        {
          line: 3,
          messageId: 'disallowedPromiseAwait',
        },
      ],
      options: ['never'],
      output: `
        async function test() {
          return Promise.resolve(1);
        }
      `,
    },
    {
      code: `
        async function test() {
          return await 1;
        }
      `,
      errors: [
        {
          line: 3,
          messageId: 'nonPromiseAwait',
        },
      ],
      options: ['always'],
      output: `
        async function test() {
          return 1;
        }
      `,
    },
    {
      code: `
        async function test() {
          return Promise.resolve(1);
        }
      `,
      errors: [
        {
          line: 3,
          messageId: 'requiredPromiseAwait',
        },
      ],
      options: ['always'],
      output: `
        async function test() {
          return await Promise.resolve(1);
        }
      `,
    },
    {
      code: 'const test = async () => Promise.resolve(1);',
      errors: [
        {
          line: 1,
          messageId: 'requiredPromiseAwait',
        },
      ],
      options: ['always'],
      output: 'const test = async () => await Promise.resolve(1);',
    },
    {
      code: `
async function foo() {}
async function bar() {}
async function baz() {}
async function qux() {}
async function buzz() {
  return (await foo()) ? bar() : baz();
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
      options: ['always'],
      output: `
async function foo() {}
async function bar() {}
async function baz() {}
async function qux() {}
async function buzz() {
  return (await foo()) ? await bar() : await baz();
}
      `,
    },
    {
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
      options: ['always'],
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
    },
    {
      code: `
async function foo() {}
async function bar() {}
async function buzz() {
  return (await foo()) ? await 1 : bar();
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
      options: ['always'],
      output: `
async function foo() {}
async function bar() {}
async function buzz() {
  return (await foo()) ? 1 : await bar();
}
      `,
    },
    {
      code: `
async function foo() {}
async function bar() {}
async function baz() {}
const buzz = async () => ((await foo()) ? bar() : baz());
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
      options: ['always'],
      output: `
async function foo() {}
async function bar() {}
async function baz() {}
const buzz = async () => ((await foo()) ? await bar() : await baz());
      `,
    },
    {
      code: `
async function foo() {}
async function bar() {}
const buzz = async () => ((await foo()) ? await 1 : bar());
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
      options: ['always'],
      output: `
async function foo() {}
async function bar() {}
const buzz = async () => ((await foo()) ? 1 : await bar());
      `,
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
      errors: [
        {
          line: 5,
          messageId: 'requiredPromiseAwait',
          suggestions: [
            {
              messageId: 'requiredPromiseAwaitSuggestion',
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
            },
          ],
        },
      ],
      output: null,
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
      errors: [
        {
          line: 10,
          messageId: 'requiredPromiseAwait',
          suggestions: [
            {
              messageId: 'requiredPromiseAwaitSuggestion',
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
            },
          ],
        },
      ],
      output: null,
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
      errors: [
        {
          line: 5,
          messageId: 'requiredPromiseAwait',
          suggestions: [
            {
              messageId: 'requiredPromiseAwaitSuggestion',
              output: `
        async function bar() {}
        async function foo() {
          try {
            return await (undefined || bar());
          } catch {}
        }
      `,
            },
          ],
        },
      ],
      output: null,
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
      errors: [
        {
          line: 5,
          messageId: 'requiredPromiseAwait',
          suggestions: [
            {
              messageId: 'requiredPromiseAwaitSuggestion',
              output: `
        async function bar() {}
        async function foo() {
          try {
            return await (bar() || undefined || bar());
          } catch {}
        }
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
async function bar() {}
async function func1() {
  try {
    return null ?? bar();
  } catch {}
}
      `,
      errors: [
        {
          line: 5,
          messageId: 'requiredPromiseAwait',
          suggestions: [
            {
              messageId: 'requiredPromiseAwaitSuggestion',
              output: `
async function bar() {}
async function func1() {
  try {
    return await (null ?? bar());
  } catch {}
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
async function bar() {}
async function func2() {
  try {
    return 1 && bar();
  } catch {}
}
      `,
      errors: [
        {
          line: 5,
          messageId: 'requiredPromiseAwait',
          suggestions: [
            {
              messageId: 'requiredPromiseAwaitSuggestion',
              output: `
async function bar() {}
async function func2() {
  try {
    return await (1 && bar());
  } catch {}
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
const foo = {
  bar: async function () {},
};
async function func3() {
  try {
    return foo.bar();
  } catch {}
}
      `,
      errors: [
        {
          line: 7,
          messageId: 'requiredPromiseAwait',
          suggestions: [
            {
              messageId: 'requiredPromiseAwaitSuggestion',
              output: `
const foo = {
  bar: async function () {},
};
async function func3() {
  try {
    return await foo.bar();
  } catch {}
}
      `,
            },
          ],
        },
      ],
      output: null,
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
      errors: [
        {
          line: 8,
          messageId: 'requiredPromiseAwait',
          suggestions: [
            {
              messageId: 'requiredPromiseAwaitSuggestion',
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
            },
          ],
        },
      ],
      output: null,
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
      errors: [
        {
          line: 10,
          messageId: 'disallowedPromiseAwait',
        },
      ],
      output: `
        async function test() {
          const res = await Promise.resolve('{}');
          try {
            async function nested() {
              return Promise.resolve('ok');
            }
            return await nested();
          } catch (error) {
            return Promise.resolve('error');
          }
        }
      `,
    },
    {
      code: `
async function f() {
  try {
    try {
    } finally {
      // affects error handling of outer catch
      return Promise.reject();
    }
  } catch {}
}
      `,
      errors: [
        {
          line: 7,
          messageId: 'requiredPromiseAwait',
          suggestions: [
            {
              messageId: 'requiredPromiseAwaitSuggestion',
              output: `
async function f() {
  try {
    try {
    } finally {
      // affects error handling of outer catch
      return await Promise.reject();
    }
  } catch {}
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
async function f() {
  try {
    try {
    } catch {
      // affects error handling of outer catch
      return Promise.reject();
    }
  } catch {}
}
      `,
      errors: [
        {
          line: 7,
          messageId: 'requiredPromiseAwait',
          suggestions: [
            {
              messageId: 'requiredPromiseAwaitSuggestion',
              output: `
async function f() {
  try {
    try {
    } catch {
      // affects error handling of outer catch
      return await Promise.reject();
    }
  } catch {}
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
async function f() {
  try {
  } catch {
    try {
    } finally {
      try {
      } catch {
        return Promise.reject();
      }
    }
  } finally {
  }
}
      `,
      errors: [
        {
          line: 9,
          messageId: 'requiredPromiseAwait',
          suggestions: [
            {
              messageId: 'requiredPromiseAwaitSuggestion',
              output: `
async function f() {
  try {
  } catch {
    try {
    } finally {
      try {
      } catch {
        return await Promise.reject();
      }
    }
  } finally {
  }
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare const bleh: any;
async function f() {
  if (cond) {
    using something = bleh;
    if (anotherCondition) {
      return Promise.resolve(2);
    }
  }
}
      `,
      errors: [
        {
          line: 7,
          messageId: 'requiredPromiseAwait',
          suggestions: [
            {
              messageId: 'requiredPromiseAwaitSuggestion',
              output: `
declare const bleh: any;
async function f() {
  if (cond) {
    using something = bleh;
    if (anotherCondition) {
      return await Promise.resolve(2);
    }
  }
}
      `,
            },
          ],
        },
      ],
      options: ['always'],
      output: null,
    },
    {
      code: `
declare const bleh: any;
async function f() {
  if (cond) {
    await using something = bleh;
    if (anotherCondition) {
      return Promise.resolve(2);
    }
  }
}
      `,
      errors: [
        {
          line: 7,
          messageId: 'requiredPromiseAwait',
          suggestions: [
            {
              messageId: 'requiredPromiseAwaitSuggestion',
              output: `
declare const bleh: any;
async function f() {
  if (cond) {
    await using something = bleh;
    if (anotherCondition) {
      return await Promise.resolve(2);
    }
  }
}
      `,
            },
          ],
        },
      ],
      options: ['always'],
      output: null,
    },
    {
      code: `
declare const bleh: any;
async function f() {
  if (cond) {
    using something = bleh;
  } else if (anotherCondition) {
    return Promise.resolve(2);
  }
}
      `,
      errors: [
        {
          line: 7,
          messageId: 'requiredPromiseAwait',
        },
      ],
      options: ['always'],
      output: `
declare const bleh: any;
async function f() {
  if (cond) {
    using something = bleh;
  } else if (anotherCondition) {
    return await Promise.resolve(2);
  }
}
      `,
    },
    {
      code: `
declare function asyncFn(): Promise<unknown>;
async function outerFunction() {
  using _ = {
    [Symbol.dispose]: () => {
      console.log('dispose');
    },
  };

  async function innerFunction() {
    return await asyncFn();
  }
}
      `,
      errors: [
        {
          line: 11,
          messageId: 'disallowedPromiseAwait',
        },
      ],
      options: ['in-try-catch'],
      output: `
declare function asyncFn(): Promise<unknown>;
async function outerFunction() {
  using _ = {
    [Symbol.dispose]: () => {
      console.log('dispose');
    },
  };

  async function innerFunction() {
    return asyncFn();
  }
}
      `,
    },
    {
      code: `
declare function asyncFn(): Promise<unknown>;
async function outerFunction() {
  using _ = {
    [Symbol.dispose]: () => {
      console.log('dispose');
    },
  };

  const innerFunction = async () => await asyncFn();
}
      `,
      errors: [
        {
          line: 10,
          messageId: 'disallowedPromiseAwait',
        },
      ],
      options: ['in-try-catch'],
      output: `
declare function asyncFn(): Promise<unknown>;
async function outerFunction() {
  using _ = {
    [Symbol.dispose]: () => {
      console.log('dispose');
    },
  };

  const innerFunction = async () => asyncFn();
}
      `,
    },
    {
      code: `
async function wrapper<T extends number>(value: T) {
  return await value;
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'nonPromiseAwait',
        },
      ],
      output: `
async function wrapper<T extends number>(value: T) {
  return value;
}
      `,
    },
    {
      code: `
class C<T> {
  async wrapper<T extends string>(value: T) {
    return await value;
  }
}
      `,
      errors: [
        {
          line: 4,
          messageId: 'nonPromiseAwait',
        },
      ],
      output: `
class C<T> {
  async wrapper<T extends string>(value: T) {
    return value;
  }
}
      `,
    },
    {
      code: `
class C<R extends number> {
  async wrapper<T extends R>(value: T) {
    return await value;
  }
}
      `,
      errors: [
        {
          line: 4,
          messageId: 'nonPromiseAwait',
        },
      ],
      output: `
class C<R extends number> {
  async wrapper<T extends R>(value: T) {
    return value;
  }
}
      `,
    },
  ],
});
