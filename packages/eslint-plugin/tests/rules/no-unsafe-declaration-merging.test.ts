import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unsafe-declaration-merging';
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

ruleTester.run('no-unsafe-declaration-merging', rule, {
  invalid: [
    {
      code: `
interface Foo {}
class Foo {}
      `,
      errors: [
        {
          column: 11,
          line: 2,
          messageId: 'unsafeMerging',
        },
        {
          column: 7,
          line: 3,
          messageId: 'unsafeMerging',
        },
      ],
    },
    {
      code: `
class Foo {}
interface Foo {}
      `,
      errors: [
        {
          column: 7,
          line: 2,
          messageId: 'unsafeMerging',
        },
        {
          column: 11,
          line: 3,
          messageId: 'unsafeMerging',
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
          column: 13,
          line: 3,
          messageId: 'unsafeMerging',
        },
        {
          column: 9,
          line: 4,
          messageId: 'unsafeMerging',
        },
      ],
    },
  ],
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
});
