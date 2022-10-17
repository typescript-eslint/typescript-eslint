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
        },
        {
          messageId: 'unsafeMerging',
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
        },
        {
          messageId: 'unsafeMerging',
        },
      ],
    },
  ],
});
