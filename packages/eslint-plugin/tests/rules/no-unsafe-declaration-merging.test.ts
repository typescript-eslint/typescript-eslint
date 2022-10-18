import rule from '../../src/rules/no-unsafe-declaration-merging';
import { getFixturesRootDir, RuleTester } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('no-unsafe-declaration-merging', rule, {
  valid: [
    `
interface Foo {}
class Bar implements Foo {}
    `,
    `
namespace Foo {}
namespace Foo {}
    `,
    `
enum Foo {}
namespace Foo {}
    `,
    `
namespace Fooo {}
function Foo() {}
    `,
    `
const Foo = class {};
    `,
    `
interface Foo {
  props: string;
}

function bar() {
  return class Foo {};
}
    `,
    `
interface Foo {
  props: string;
}

(function bar() {
  class Foo {}
})();
    `,
    `
declare global {
  interface Foo {}
}

class Foo {}
    `,
  ],
  invalid: [
    {
      code: `
interface Foo {}
class Foo {}
      `,
      errors: [
        {
          messageId: 'unsafeMerging',
          line: 2,
          column: 11,
        },
        {
          messageId: 'unsafeMerging',
          line: 3,
          column: 7,
        },
      ],
    },
    {
      code: `
namespace Foo {
  export interface Bar {}
}
namespace Foo {
  export class Bar {}
}
      `,
      errors: [
        {
          messageId: 'unsafeMerging',
          line: 3,
          column: 20,
        },
        {
          messageId: 'unsafeMerging',
          line: 6,
          column: 16,
        },
      ],
    },
    {
      code: `
declare global {
  interface Foo {}
  class Foo {}
}
      `,
      errors: [
        {
          messageId: 'unsafeMerging',
          line: 3,
          column: 13,
        },
        {
          messageId: 'unsafeMerging',
          line: 4,
          column: 9,
        },
      ],
    },
  ],
});
