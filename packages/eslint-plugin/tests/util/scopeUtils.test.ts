import type { TSESTree } from '@typescript-eslint/utils';

import { RuleTester } from '@typescript-eslint/rule-tester';

import {
  createRule,
  findShadowingVariable,
  isReferenceToGlobalFunction,
} from '../../src/util';

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
    // an `infer` type parameter is only visible in the true branch
    {
      code: 'type T<U> = U extends [infer String] ? 1 : String;',
      errors: global,
    },
    {
      code: 'type T<U> = U extends [infer String, String] ? 1 : 0;',
      errors: global,
    },
    {
      code: 'type T<U> = U extends (value: infer String) => String ? 1 : 0;',
      errors: global,
    },
    {
      code: `
type T<U> = U extends [infer String]
  ? 1
  : U extends [infer V]
    ? String
    : 0;
      `,
      errors: global,
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
    'type T<U> = U extends [infer String] ? String : 0;',
    'type T<U> = U extends [infer String] ? (U extends 1 ? 1 : String) : 0;',
    'type T<U> = U extends { a: infer String } ? { b: String } : 0;',
  ],
});

// Reports each `string` keyword where a `Record` type written in its place
// would be the global.
const typeAtRule = createRule<[{ withNode?: boolean }?], 'global'>({
  create(context) {
    const withNode = context.options[0]?.withNode ?? true;

    return {
      TSStringKeyword(node): void {
        if (
          !findShadowingVariable(
            'Record',
            context.sourceCode.getScope(node),
            'type',
            withNode ? { node } : {},
          )
        ) {
          context.report({ messageId: 'global', node });
        }
      },
    };
  },
  meta: {
    docs: { description: 'Report where the global Record type is visible.' },
    messages: { global: 'Global.' },
    schema: [
      {
        additionalProperties: false,
        properties: { withNode: { type: 'boolean' } },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
  name: 'global-type-at',
});

ruleTester.run('findShadowingVariable', typeAtRule, {
  invalid: [
    { code: 'type T = string;', errors: global },
    {
      code: 'type T<U> = U extends [infer Record] ? 1 : string;',
      errors: global,
    },
    {
      code: 'type T<U> = U extends [infer Record, string] ? 1 : 0;',
      errors: global,
    },
    {
      code: 'type T<U> = U extends (value: infer Record) => string ? 1 : 0;',
      errors: global,
    },
    {
      code: 'type T<U> = U extends [infer Record] ? 1 : { [K in string]: 1 };',
      errors: global,
    },
    // the true branch of a conditional type in the false branch doesn't see it
    {
      code: `
type T<U> = U extends [infer Record]
  ? 1
  : U extends [infer V]
    ? string
    : 0;
      `,
      errors: global,
    },
    // past the `infer` type parameter, `declare global` augments the global
    {
      code: `
export {};
declare global {
  interface Record {}
  type T<U> = U extends [infer Record] ? 1 : string;
}
      `,
      errors: global,
    },
  ],
  valid: [
    'type T<Record> = string;',
    'type T<U> = U extends [infer Record] ? string : 0;',
    'type T<U> = U extends [infer Record] ? { [K in string]: 1 } : 0;',
    // the false branch of a conditional type in the true branch sees it
    'type T<U> = U extends [infer Record] ? (U extends 1 ? 1 : string) : 0;',
    'type T<U> = U extends [infer Record] ? (U extends string ? 1 : 0) : 0;',
    // an outer `Record` is still found past the `infer` type parameter
    `
type T<Record, U> = U extends [infer Record] ? 1 : string;
    `,
    // without `node`, an `infer` type parameter hides `Record` everywhere in
    // its conditional type
    {
      code: 'type T<U> = U extends [infer Record] ? 1 : string;',
      options: [{ withNode: false }],
    },
  ],
});
