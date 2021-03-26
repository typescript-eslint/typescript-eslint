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
}
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
  ],
});
