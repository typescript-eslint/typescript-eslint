import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/prefer-return-this-type';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootPath,
    },
  },
});

ruleTester.run('prefer-return-this-type', rule, {
  invalid: [
    {
      code: `
class Foo {
  f(): Foo {
    return this;
  }
}
      `,
      errors: [
        {
          column: 8,
          line: 3,
          messageId: 'useThisType',
        },
      ],
      output: `
class Foo {
  f(): this {
    return this;
  }
}
      `,
    },
    {
      code: `
class Foo {
  f = function (): Foo {
    return this;
  };
}
      `,
      errors: [
        {
          column: 20,
          line: 3,
          messageId: 'useThisType',
        },
      ],
      output: `
class Foo {
  f = function (): this {
    return this;
  };
}
      `,
    },
    {
      code: `
class Foo {
  f(): Foo {
    const self = this;
    return self;
  }
}
      `,
      errors: [
        {
          column: 8,
          line: 3,
          messageId: 'useThisType',
        },
      ],
      output: `
class Foo {
  f(): this {
    const self = this;
    return self;
  }
}
      `,
    },
    {
      code: `
class Foo {
  f = (): Foo => {
    return this;
  };
}
      `,
      errors: [
        {
          column: 11,
          line: 3,
          messageId: 'useThisType',
        },
      ],
      output: `
class Foo {
  f = (): this => {
    return this;
  };
}
      `,
    },
    {
      code: `
class Foo {
  f = (): Foo => {
    const self = this;
    return self;
  };
}
      `,
      errors: [
        {
          column: 11,
          line: 3,
          messageId: 'useThisType',
        },
      ],
      output: `
class Foo {
  f = (): this => {
    const self = this;
    return self;
  };
}
      `,
    },
    {
      code: `
class Foo {
  f = (): Foo => this;
}
      `,
      errors: [
        {
          column: 11,
          line: 3,
          messageId: 'useThisType',
        },
      ],
      output: `
class Foo {
  f = (): this => this;
}
      `,
    },
    {
      code: `
class Foo {
  accessor f = (): Foo => {
    return this;
  };
}
      `,
      errors: [
        {
          column: 20,
          line: 3,
          messageId: 'useThisType',
        },
      ],
      output: `
class Foo {
  accessor f = (): this => {
    return this;
  };
}
      `,
    },
    {
      code: `
class Foo {
  accessor f = (): Foo => this;
}
      `,
      errors: [
        {
          column: 20,
          line: 3,
          messageId: 'useThisType',
        },
      ],
      output: `
class Foo {
  accessor f = (): this => this;
}
      `,
    },
    {
      code: `
class Foo {
  f1(): Foo | undefined {
    return this;
  }
  f2(): this | undefined {
    return this;
  }
}
      `,
      errors: [
        {
          column: 9,
          line: 3,
          messageId: 'useThisType',
        },
      ],
      output: `
class Foo {
  f1(): this | undefined {
    return this;
  }
  f2(): this | undefined {
    return this;
  }
}
      `,
    },
    {
      code: `
class Foo {
  bar(): Foo | undefined {
    if (Math.random() > 0.5) {
      return this;
    }
  }
}
      `,
      errors: [
        {
          column: 10,
          line: 3,
          messageId: 'useThisType',
        },
      ],
      output: `
class Foo {
  bar(): this | undefined {
    if (Math.random() > 0.5) {
      return this;
    }
  }
}
      `,
    },
    {
      code: `
class Foo {
  bar(num: 1 | 2): Foo {
    switch (num) {
      case 1:
        return this;
      case 2:
        return this;
    }
  }
}
      `,
      errors: [
        {
          column: 20,
          line: 3,
          messageId: 'useThisType',
        },
      ],
      output: `
class Foo {
  bar(num: 1 | 2): this {
    switch (num) {
      case 1:
        return this;
      case 2:
        return this;
    }
  }
}
      `,
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/3842
      code: `
class Animal<T> {
  eat(): Animal<T> {
    console.log("I'm moving!");
    return this;
  }
}
      `,
      errors: [
        {
          column: 10,
          endColumn: 19,
          line: 3,
          messageId: 'useThisType',
        },
      ],
      output: `
class Animal<T> {
  eat(): this {
    console.log("I'm moving!");
    return this;
  }
}
      `,
    },
  ],
  valid: [
    `
class Foo {
  f1() {}
  f2(): Foo {
    return new Foo();
  }
  f3() {
    return this;
  }
  f4(): this {
    return this;
  }
  f5(): any {
    return this;
  }
  f6(): unknown {
    return this;
  }
  f7(foo: Foo): Foo {
    return Math.random() > 0.5 ? foo : this;
  }
  f10(this: Foo, that: Foo): Foo;
  f11(): Foo {
    return;
  }
  f13(this: Foo): Foo {
    return this;
  }
  f14(): { f14: Function } {
    return this;
  }
  f15(): Foo | this {
    return Math.random() > 0.5 ? new Foo() : this;
  }
}
    `,
    `
class Foo {
  f1 = () => {};
  f2 = (): Foo => {
    return new Foo();
  };
  f3 = () => this;
  f4 = (): this => {
    return this;
  };
  f5 = (): Foo => new Foo();
  f6 = '';
}
    `,
    `
const Foo = class {
  bar() {
    return this;
  }
};
    `,
    `
class Base {}
class Derived extends Base {
  f(): Base {
    return this;
  }
}
    `,
    `
class Foo {
  accessor f = () => {
    return this;
  };
}
    `,
    `
class Foo {
  accessor f = (): this => {
    return this;
  };
}
    `,
    `
class Foo {
  f?: string;
}
    `,
  ],
});
