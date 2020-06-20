/* eslint-disable eslint-comments/no-use */
// this rule tests the new lines, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */
import rule from '../../src/rules/lines-between-class-members';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('lines-between-class-members', rule, {
  valid: [
    {
      code: `
class foo {
baz1() { }

baz2() { }

bar(a: string): void;
bar(a: string, b:string): void;
bar(a: string, b:string) {

}

qux1() { }

qux2() { }
};
      `,
      options: ['always'],
    },
    {
      code: `
class foo {
bar(a: string): void;
bar(a: string, b:string): void;
bar(a: string, b:string) {

}

baz() { }

qux() { }
};
      `,
      options: ['always', { exceptAfterOverload: true }],
    },
    {
      code: `
class foo {
bar(a: string): void;
bar(a: string, b:string): void;
bar(a: string, b:string) {

}

baz() { }
qux() { }
};
      `,
      options: [
        'always',
        { exceptAfterOverload: true, exceptAfterSingleLine: true },
      ],
    },
    {
      code: `
class foo{
bar(a: string):void;

bar(a: string, b:string):void;

bar(a: string, b:string){

}

baz() { }

qux() { }
};
      `,
      options: [
        'always',
        { exceptAfterOverload: false, exceptAfterSingleLine: false },
      ],
    },
    {
      code: `
class foo {
bar(a: string):void
bar(a: string, b:string):void;
bar(a: string, b:string){

}
baz() { }
qux() { }
};
      `,
      options: [
        'never',
        { exceptAfterOverload: true, exceptAfterSingleLine: true },
      ],
    },
    {
      code: `
class foo{
bar(a: string):void
bar(a: string, b:string):void;
bar(a: string, b:string){

}
baz() { }
qux() { }
};
      `,
      options: [
        'never',
        { exceptAfterOverload: true, exceptAfterSingleLine: true },
      ],
    },
  ],
  invalid: [
    {
      code: `
class foo {
baz1() { }
baz2() { }

bar(a: string): void;
bar(a: string, b:string): void;
bar(a: string, b:string) {

}

qux1() { }
qux2() { }
};
      `,
      output: `
class foo {
baz1() { }

baz2() { }

bar(a: string): void;
bar(a: string, b:string): void;
bar(a: string, b:string) {

}

qux1() { }

qux2() { }
};
      `,
      options: ['always'],
      errors: [
        {
          messageId: 'always',
        },
        {
          messageId: 'always',
        },
      ],
    },
    {
      code: `
class foo {
bar(a: string): void;
bar(a: string, b:string): void;
bar(a: string, b:string) {

}
baz() { }
qux() { }
}
      `,
      output: `
class foo {
bar(a: string): void;
bar(a: string, b:string): void;
bar(a: string, b:string) {

}

baz() { }

qux() { }
}
      `,
      options: ['always', { exceptAfterOverload: true }],
      errors: [
        {
          messageId: 'always',
        },
        {
          messageId: 'always',
        },
      ],
    },
    {
      code: `
class foo {
bar(a: string): void;
bar(a: string, b:string): void;
bar(a: string, b:string) {

}
baz() { }
qux() { }
}
      `,
      output: `
class foo {
bar(a: string): void;
bar(a: string, b:string): void;
bar(a: string, b:string) {

}

baz() { }
qux() { }
}
      `,
      options: [
        'always',
        { exceptAfterOverload: true, exceptAfterSingleLine: true },
      ],
      errors: [
        {
          messageId: 'always',
        },
      ],
    },
    {
      code: `
class foo {
bar(a: string): void;
bar(a: string, b:string): void;
bar(a: string, b:string) {

}

baz() { }
qux() { }
}
      `,
      output: `
class foo {
bar(a: string): void;

bar(a: string, b:string): void;

bar(a: string, b:string) {

}

baz() { }

qux() { }
}
      `,
      options: [
        'always',
        { exceptAfterOverload: false, exceptAfterSingleLine: false },
      ],
      errors: [
        {
          messageId: 'always',
        },
        {
          messageId: 'always',
        },
        {
          messageId: 'always',
        },
      ],
    },
    {
      code: `
class foo{
bar(a: string):void;

bar(a: string, b:string):void;

bar(a: string, b:string){

}

baz() { }

qux() { }
};
      `,
      output: `
class foo{
bar(a: string):void;
bar(a: string, b:string):void;
bar(a: string, b:string){

}
baz() { }
qux() { }
};
      `,
      options: [
        'never',
        { exceptAfterOverload: true, exceptAfterSingleLine: true },
      ],
      errors: [
        {
          messageId: 'never',
        },
        {
          messageId: 'never',
        },
        {
          messageId: 'never',
        },
        {
          messageId: 'never',
        },
      ],
    },
  ],
});
