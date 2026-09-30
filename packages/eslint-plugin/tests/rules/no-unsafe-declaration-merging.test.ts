import rule from '../../src/rules/no-unsafe-declaration-merging';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-unsafe-declaration-merging', rule, {
  assertionOptions: {
    requireData: true,
  },
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
          column: 11,
          endColumn: 14,
          endLine: 2,
          line: 2,
          messageId: 'unsafeMerging',
        },
        {
          column: 7,
          endColumn: 10,
          endLine: 3,
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
          endColumn: 10,
          endLine: 2,
          line: 2,
          messageId: 'unsafeMerging',
        },
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
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
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'unsafeMerging',
        },
        {
          column: 9,
          endColumn: 12,
          endLine: 4,
          line: 4,
          messageId: 'unsafeMerging',
        },
      ],
    },
  ],
});
