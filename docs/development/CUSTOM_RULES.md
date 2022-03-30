---
id: custom-rules
sidebar_label: Custom Rules
title: Custom Rules
---

:::important
You should be familiar with [ESLint's developer guide](https://eslint.org/docs/developer-guide) and [Development > Architecture](./architecture/asts) before writing custom rules.
:::

As long as you are using `@typescript-eslint/parser` as the `parser` in your ESLint configuration, custom ESLint rules generally work the same way for JavaScript and TypeScript code.
The main three changes to custom rules writing are:

- [Utils Package](#utils-package): we recommend using `@typescript-eslint/utils` to create custom rules
- [AST Extensions](#ast-extensions): targeting TypeScript-specific syntax in your rule selectors
- [Typed Rules](#typed-rules): using the TypeScript type checker to inform rule logic

## Utils Package

The `@typescript-eslint/utils` package acts as a replacement package for `eslint` that exports all the same objects and types, but with typescript-eslint support.
It also exports common utility functions and constants most custom typescript-eslint rules tend to use.

:::caution
`@types/eslint` types are based on `@types/estree` and do not recognize typescript-eslint nodes and properties.
You should generally not need to import from `eslint` when writing custom typescript-eslint rules in TypeScript.
:::

### `RuleCreator`

The recommended way to create custom ESLint rules that make use of typescript-eslint features and/or syntax is with the `ESLintUtils.RuleCreator` function exported by `@typescript-eslint/utils`.

It takes in a function that transforms a rule name into its documentation URL, then returns a function that takes in a rule module object.
`RuleCreator` will infer the allowed message IDs the rule is allowed to emit from the provided `meta.messages` object.

This rule bans function declarations that start with a lower-case letter:

```ts
import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`
);

// Type: RuleModule<"uppercase", ...>
export const rule = createRule({
  create(context) {
    return {
      FunctionDeclaration(node) {
        if (node.id != null) {
          if (/^[a-z]/.test(node.id.name)) {
            context.report({
              messageId: "uppercase",
              node: node.id,
            });
          }
        }
      },
    };
  },
  name: "uppercase-first-declarations",
  meta: {
    docs: {
      description:
        "Function declaration names should start with an upper-case letter.",
      recommended: "warn",
    },
    messages: {
      uppercase: "Start this name with an upper-case letter.",
    },
    type: "suggestion",
    schema: [],
  },
  defaultOptions: [],
});
```

`RuleCreator` rule creator functions return rules typed as the `RuleModule` interface exported by `@typescript-eslint/utils`.
It allows specifying generics for:

- `MessageIds`: a union of string literal message IDs that may be reported
- `Options`: what options users may configure for the rule (by default, `[]`)

If the rule is able to take in rule options, declare them as a tuple type containing a single object of rule options:

```ts
import { ESLintUtils } from '@typescript-eslint/utils';

type MessageIds = 'lowercase' | 'uppercase';

type Options = [
  {
    preferredCase?: 'lower' | 'upper';
  },
];

// Type: RuleModule<MessageIds, Options, ...>
export const rule = createRule<Options, MessageIds>({
  // ...
});
```

### Undocumented Rules

Although it is generally not recommended to create custom rules without documentation, if you are sure you want to do this you can use the `ESLintUtils.RuleCreator.withoutDocs` function to directly create a rule.
It applies the same type inference as the `createRule`s above without enforcing a documentation URL.

```ts
import { ESLintUtils } from '@typescript-eslint/utils';

export const rule = ESLintUtils.RuleCreator.withoutDocs({
  create(context) {
    // ...
  },
  meta: {
    // ...
  },
});
```

:::caution
We recommend any custom ESLint rule include a descriptive error message and link to informative documentation.
:::

## AST Extensions

`@typescript-eslint/estree` creates AST nodes for TypeScript syntax with names that begin with `TS`, such as `TSInterfaceDeclaration` and `TSTypeAnnotation`.
These nodes are treated just like any other AST node.
You can query for them in your rule selectors.

This version of the above rule instead bans interface declaration names that start with a lower-case letter:

```ts
import { ESLintUtils } from '@typescript-eslint/utils';

export const rule = createRule({
  create(context) {
    return {
      TSInterfaceDeclaration(node) {
        if (/^[a-z]/.test(node.id.name)) {
          // ...
        }
      },
    };
  },
  // ...
});
```

### Node Types

TypeScript types for nodes exist in a `TSESTree` namespace exported by `@typescript-eslint/utils`.
The above rule body could be better written in TypeScript with a type annotation on the `node`:

An `AST_NODE_TYPES` enum is exported as well to hold the values for AST node `type` properties.
`TSESTree.Node` is available as union type that uses its `type` member as a discriminant.

For example, checking `node.type` can narrow down the type of the `node`:

```ts
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';

export function describeNode(node: TSESTree.Node): string {
  switch (node.type) {
    case AST_NODE_TYPES.ArrayExpression:
      return `Array containing ${node.elements.map(describeNode).join(', ')}`;

    case AST_NODE_TYPES.Literal:
      return `Literal value ${node.raw}`;

    default:
      return '🤷';
  }
}
```

### Explicit Node Types

Rule queries that use more features of [esquery](https://github.com/estools/esquery) such as targeting multiple node types may not be able to infer the type of the `node`.
In that case, it is best to add an explicit type declaration.

This rule snippet targets name nodes of both function and interface declarations:

```ts
import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';

export const rule = createRule({
  create(context) {
    return {
      'FunctionDeclaration, TSInterfaceDeclaration'(
        node:
          | AST_NODE_TYPES.FunctionDeclaration
          | AST_NODE_TYPES.TSInterfaceDeclaration,
      ) {
        if (/^[a-z]/.test(node.id.name)) {
          // ...
        }
      },
    };
  },
  // ...
});
```

## Type Checking

:::tip
Read TypeScript's [Compiler APIs > Using the Type Checker](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#using-the-type-checker) section for how to use a program's type checker.
:::

The biggest addition typescript-eslint brings to ESLint rules is the ability to use TypeScript's type checker APIs.

`@typescript-eslint/utils` exports an `ESLintUtils` namespace containing a `getParserServices` function that takes in an ESLint context and returns a `parserServices` object.

That `parserServices` object contains:

- `program`: A full TypeScript `ts.Program` object
- `esTreeNodeToTSNodeMap`: Map of `@typescript-eslint/estree` `TSESTree.Node` nodes to their TypeScript `ts.Node` equivalents
- `tsNodeToESTreeNodeMap`: Map of TypeScript `ts.Node` nodes to their `@typescript-eslint/estree` `TSESTree.Node` equivalents

By mapping from ESTree nodes to TypeScript nodes and retrieving the TypeScript program from the parser services, rules are able to ask TypeScript for full type information on those nodes.

This rule bans for-of looping over an enum by using the type-checker via typescript-eslint and TypeScript APIs:

```ts
import { ESLintUtils } from '@typescript-eslint/utils';
import * as ts from 'typescript';
import * as tsutils from 'tsutils';

export const rule: eslint.Rule.RuleModule = {
  create(context) {
    return {
      ForOfStatement(node) {
        // 1. Grab the TypeScript program from parser services
        const parserServices = ESLintUtils.getParserServices(context);
        const checker = parserServices.program.getTypeChecker();

        // 2. Find the backing TS node for the ES node, then that TS type
        const originalNode = parserServices.esTreeNodeToTSNodeMap.get(
          node.right,
        );
        const nodeType = checker.getTypeAtLocation(originalNode);

        // 3. Check the TS node type using the TypeScript APIs
        if (tsutils.isTypeFlagSet(nodeType, ts.TypeFlags.EnumLike)) {
          context.report({
            messageId: 'loopOverEnum',
            node: node.right,
          });
        }
      },
    };
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Avoid looping over enums.',
    },
    messages: {
      loopOverEnum: 'Do not loop over enums.',
    },
    type: 'suggestion',
    schema: [],
  },
};
```

## Testing

`@typescript-eslint/utils` exports a `RuleTester` with a similar API to the built-in [ESLint `RuleTester`](https://eslint.org/docs/developer-guide/nodejs-api#ruletester).
It should be provided with the same `parser` and `parserOptions` you would use in your ESLint configuration.

### Testing Untyped Rules

For rules that don't need type information, passing just the `parser` will do:

```ts
import { ESLintUtils } from '@typescript-eslint/utils';
import rule from './my-rule';

const ruleTester = new ESLintUtils.RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('my-rule', rule, {
  valid: [
    /* ... */
  ],
  invalid: [
    /* ... */
  ],
});
```

### Testing Typed Rules

For rules that do need type information, `parserOptions` must be passed in as well.
Tests must have at least an absolute `tsconfigRootDir` path provided as well as a relative `project` path from that directory:

```ts
import { ESLintUtils } from '@typescript-eslint/utils';
import rule from './my-typed-rule';

const ruleTester = new ESLintUtils.RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
});

ruleTester.run('my-typed-rule', rule, {
  valid: [
    /* ... */
  ],
  invalid: [
    /* ... */
  ],
});
```

:::note
For now, `ESLintUtils.RuleTester` requires the following physical files be present on disk for typed rules:

- `tsconfig.json`: tsconfig used as the test "project"
- One of the following two files:
  - `file.ts`: blank test file used for normal TS tests
  - `file.tsx`: blank test file used for tests with `parserOptions: { ecmaFeatures: { jsx: true } }`

:::
