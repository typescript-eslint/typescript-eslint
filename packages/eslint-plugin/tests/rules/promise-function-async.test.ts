import rule from '../../src/rules/promise-function-async';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const messageId = 'missingAsync';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('promise-function-async', rule, {
  valid: [
    `
const nonAsyncNonPromiseArrowFunction = (n: number) => n;
    `,
    `
function nonAsyncNonPromiseFunctionDeclaration(n: number) {
  return n;
}
    `,
    `
const asyncPromiseFunctionExpressionA = async function (p: Promise<void>) {
  return p;
};
    `,
    `
const asyncPromiseFunctionExpressionB = async function () {
  return new Promise<void>();
};
    `,
    `
class Test {
  public nonAsyncNonPromiseArrowFunction = (n: number) => n;
  public nonAsyncNonPromiseMethod() {
    return 0;
  }

  public async asyncPromiseMethodA(p: Promise<void>) {
    return p;
  }

  public async asyncPromiseMethodB() {
    return new Promise<void>();
  }
}
    `,
    `
class InvalidAsyncModifiers {
  public constructor() {
    return new Promise<void>();
  }
  public get asyncGetter() {
    return new Promise<void>();
  }
  public set asyncGetter(p: Promise<void>) {
    return p;
  }
  public get asyncGetterFunc() {
    return async () => new Promise<void>();
  }
  public set asyncGetterFunc(p: () => Promise<void>) {
    return p;
  }
}
    `,
    `
const invalidAsyncModifiers = {
  get asyncGetter() {
    return new Promise<void>();
  },
  set asyncGetter(p: Promise<void>) {
    return p;
  },
  get asyncGetterFunc() {
    return async () => new Promise<void>();
  },
  set asyncGetterFunc(p: () => Promise<void>) {
    return p;
  },
};
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/227
    `
      export function valid(n: number) {
        return n;
      }
    `,
    `
      export default function invalid(n: number) {
        return n;
      }
    `,
    `
      class Foo {
        constructor() {}
      }
    `,
    {
      code: `
function returnsAny(): any {
  return 0;
}
      `,
      options: [
        {
          allowAny: true,
        },
      ],
    },
    {
      code: `
function returnsUnknown(): unknown {
  return 0;
}
      `,
      options: [
        {
          allowAny: true,
        },
      ],
    },
    {
      code: `
interface ReadableStream {}
interface Options {
  stream: ReadableStream;
}

type Return = ReadableStream | Promise<void>;
const foo = (options: Options): Return => {
  return options.stream ? asStream(options) : asPromise(options);
};
      `,
    },
    {
      code: `
function foo(): Promise<string> | boolean {
  return Math.random() > 0.5 ? Promise.resolve('value') : false;
}
      `,
    },
  ],
  invalid: [
    {
      code: `
function returnsAny(): any {
  return 0;
}
      `,
      options: [
        {
          allowAny: false,
        },
      ],
      errors: [
        {
          messageId,
        },
      ],
    },
    {
      code: `
function returnsUnknown(): unknown {
  return 0;
}
      `,
      options: [
        {
          allowAny: false,
        },
      ],
      errors: [
        {
          messageId,
        },
      ],
    },
    {
      code: `
const nonAsyncPromiseFunctionExpressionA = function (p: Promise<void>) {
  return p;
};
      `,
      errors: [
        {
          messageId,
        },
      ],
    },
    {
      code: `
const nonAsyncPromiseFunctionExpressionB = function () {
  return new Promise<void>();
};
      `,
      errors: [
        {
          messageId,
        },
      ],
    },
    {
      code: `
function nonAsyncPromiseFunctionDeclarationA(p: Promise<void>) {
  return p;
}
      `,
      errors: [
        {
          messageId,
        },
      ],
    },
    {
      code: `
function nonAsyncPromiseFunctionDeclarationB() {
  return new Promise<void>();
}
      `,
      errors: [
        {
          messageId,
        },
      ],
    },
    {
      code: `
const nonAsyncPromiseArrowFunctionA = (p: Promise<void>) => p;
      `,
      errors: [
        {
          messageId,
        },
      ],
    },
    {
      code: `
const nonAsyncPromiseArrowFunctionB = () => new Promise<void>();
      `,
      errors: [
        {
          messageId,
        },
      ],
    },
    {
      code: `
class Test {
  public nonAsyncPromiseMethodA(p: Promise<void>) {
    return p;
  }

  public nonAsyncPromiseMethodB() {
    return new Promise<void>();
  }
}
      `,
      errors: [
        {
          line: 3,
          messageId,
        },
        {
          line: 7,
          messageId,
        },
      ],
    },
    {
      code: `
const nonAsyncPromiseFunctionExpression = function (p: Promise<void>) {
  return p;
};

function nonAsyncPromiseFunctionDeclaration(p: Promise<void>) {
  return p;
}

const nonAsyncPromiseArrowFunction = (p: Promise<void>) => p;

class Test {
  public nonAsyncPromiseMethod(p: Promise<void>) {
    return p;
  }
}
      `,
      options: [
        {
          checkArrowFunctions: false,
        },
      ],
      errors: [
        {
          line: 2,
          messageId,
        },
        {
          line: 6,
          messageId,
        },
        {
          line: 13,
          messageId,
        },
      ],
    },
    {
      code: `
const nonAsyncPromiseFunctionExpression = function (p: Promise<void>) {
  return p;
};

function nonAsyncPromiseFunctionDeclaration(p: Promise<void>) {
  return p;
}

const nonAsyncPromiseArrowFunction = (p: Promise<void>) => p;

class Test {
  public nonAsyncPromiseMethod(p: Promise<void>) {
    return p;
  }
}
      `,
      options: [
        {
          checkFunctionDeclarations: false,
        },
      ],
      errors: [
        {
          line: 2,
          messageId,
        },
        {
          line: 10,
          messageId,
        },
        {
          line: 13,
          messageId,
        },
      ],
    },
    {
      code: `
const nonAsyncPromiseFunctionExpression = function (p: Promise<void>) {
  return p;
};

function nonAsyncPromiseFunctionDeclaration(p: Promise<void>) {
  return p;
}

const nonAsyncPromiseArrowFunction = (p: Promise<void>) => p;

class Test {
  public nonAsyncPromiseMethod(p: Promise<void>) {
    return p;
  }
}
      `,
      options: [
        {
          checkFunctionExpressions: false,
        },
      ],
      errors: [
        {
          line: 6,
          messageId,
        },
        {
          line: 10,
          messageId,
        },
        {
          line: 13,
          messageId,
        },
      ],
    },
    {
      code: `
const nonAsyncPromiseFunctionExpression = function (p: Promise<void>) {
  return p;
};

function nonAsyncPromiseFunctionDeclaration(p: Promise<void>) {
  return p;
}

const nonAsyncPromiseArrowFunction = (p: Promise<void>) => p;

class Test {
  public nonAsyncPromiseMethod(p: Promise<void>) {
    return p;
  }
}
      `,
      options: [
        {
          checkMethodDeclarations: false,
        },
      ],
      errors: [
        {
          line: 2,
          messageId,
        },
        {
          line: 6,
          messageId,
        },
        {
          line: 10,
          messageId,
        },
      ],
    },
    {
      code: `
class PromiseType {}

const returnAllowedType = () => new PromiseType();
      `,
      options: [
        {
          allowedPromiseNames: ['PromiseType'],
        },
      ],
      errors: [
        {
          line: 4,
          messageId,
        },
      ],
    },
    {
      code: `
interface SPromise<T> extends Promise<T> {}
function foo(): Promise<string> | SPromise<boolean> {
  return Math.random() > 0.5
    ? Promise.resolve('value')
    : Promise.resolve(false);
}
      `,
      options: [
        {
          allowedPromiseNames: ['SPromise'],
        },
      ],
      errors: [
        {
          line: 3,
          messageId,
        },
      ],
    },
  ],
});
