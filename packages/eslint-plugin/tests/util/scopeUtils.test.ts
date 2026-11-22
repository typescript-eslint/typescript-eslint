import type { TSESTree } from '@typescript-eslint/utils';

import { RuleTester } from '@typescript-eslint/rule-tester';

import { createRule, isReferenceToGlobalFunction } from '../../src/util';

const ruleTester = new RuleTester();

// Reports each `setTimeout(...)` call and `String` type reference that
// resolves to the global.
const rule = createRule<[{ topLevelIsGlobal?: boolean }?], 'global'>({
  create(context) {
    const options = context.options[0];

    function check(node: TSESTree.Identifier): void {
      if (
        isReferenceToGlobalFunction(
          node.name,
          node,
          context.sourceCode,
          options,
        )
      ) {
        context.report({ messageId: 'global', node });
      }
    }

    return {
      'CallExpression > Identifier.callee[name="setTimeout"]': check,
      'TSTypeReference > Identifier.typeName[name="String"]': check,
    };
  },
  meta: {
    docs: { description: 'Report references to globals.' },
    messages: { global: 'Global.' },
    schema: [
      {
        additionalProperties: false,
        properties: { topLevelIsGlobal: { type: 'boolean' } },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
  name: 'global-reference',
});

const global = [{ messageId: 'global' as const }];

ruleTester.run('isReferenceToGlobalFunction', rule, {
  invalid: [
    { code: "setTimeout('');", errors: global },
    { code: 'let value: String;', errors: global },
    // a namespace without values doesn't shadow a global value
    {
      code: `
export {};
namespace setTimeout {}
setTimeout('');
      `,
      errors: global,
    },
    {
      code: `
export {};
namespace setTimeout {
  export interface I {}
  export type T = string;
  import value = Other.value;
  namespace Inner {}
}
setTimeout('');
      `,
      errors: global,
    },
    // a namespace never shadows a global type
    {
      code: `
export {};
namespace String {
  export const value = 1;
}
let value: String;
      `,
      errors: global,
    },
    {
      code: `
export {};
function String() {}
namespace String {}
let value: String;
      `,
      errors: global,
    },
    // `declare global` declarations augment the global
    {
      code: `
export {};
interface String {}
declare global {
  interface String {}
  let value: String;
}
      `,
      errors: global,
    },
    {
      code: `
interface String {}
let value: String;
      `,
      errors: global,
      options: [{ topLevelIsGlobal: true }],
    },
    {
      code: `
function setTimeout() {}
setTimeout('');
      `,
      errors: global,
      languageOptions: { parserOptions: { sourceType: 'script' } },
      options: [{ topLevelIsGlobal: true }],
    },
  ],
  valid: [
    // a namespace with values shadows a global value
    `
export {};
namespace setTimeout {
  export const value = 1;
}
setTimeout('');
    `,
    `
export {};
declare namespace setTimeout {
  const value: number;
}
setTimeout('');
    `,
    `
export {};
namespace setTimeout {
  export const enum E {
    A,
  }
}
setTimeout('');
    `,
    `
export {};
namespace setTimeout {
  export import value = Other.value;
}
setTimeout('');
    `,
    `
export {};
namespace setTimeout {
  namespace Inner {
    export const value = 1;
  }
}
setTimeout('');
    `,
    `
export {};
function setTimeout() {}
setTimeout('');
    `,
    `
export {};
interface String {}
let value: String;
    `,
    // the outer class is found past the namespace
    `
export {};
class String {}
namespace N {
  namespace String {}
  let value: String;
}
    `,
    // `String` isn't declared in `declare global`, so this is the local one
    `
export {};
interface String {}
declare global {
  let value: String;
}
    `,
    `
interface String {}
let value: String;
    `,
    {
      code: `
function f() {
  interface String {}
  let value: String;
}
      `,
      options: [{ topLevelIsGlobal: true }],
    },
  ],
});
