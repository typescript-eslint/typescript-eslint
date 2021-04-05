import rule from '../../src/rules/prefer-return-this-type';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('prefer-return-this-type', rule, {
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
  f8(): Foo | undefined {
    if (Math.random() > 0.5) {
      return this;
    }
  }
  f9(): Foo {
    if (Math.random() > 0.5) {
      return this;
    }
  }
  f10(this: Foo, that: Foo): Foo;
  f11(): Foo {
    return;
  }
  f12(num: 1 | 2): Foo {
    // TODO: should error here.
    // Wait until control flow analysis is public.
    switch (num) {
      case 1:
        return this;
      case 2:
        return this;
    }
  }
  f13(this: Foo): Foo {
    return this;
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
  ],
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
          messageId: 'UseThisType',
          line: 3,
          column: 6,
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
  f(): Foo {
    const self = this;
    return self;
  }
}
      `,
      errors: [
        {
          messageId: 'UseThisType',
          line: 3,
          column: 6,
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
          messageId: 'UseThisType',
          line: 3,
          column: 9,
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
          messageId: 'UseThisType',
          line: 3,
          column: 9,
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
          messageId: 'UseThisType',
          line: 3,
          column: 9,
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
          messageId: 'UseThisType',
          line: 3,
          column: 7,
        },
        {
          messageId: 'UseThisType',
          line: 6,
          column: 7,
        },
      ],
      output: `
class Foo {
  f1(): this {
    return this;
  }
  f2(): this {
    return this;
  }
}
      `,
    },
    {
      code: `
const Foo = class {
  bar(): {} {
    return this;
  }
};
      `,
      errors: [
        {
          line: 3,
          column: 8,
          messageId: 'UseThisType',
        },
      ],
      output: `
const Foo = class {
  bar(): this {
    return this;
  }
};
      `,
    },
  ],
});
