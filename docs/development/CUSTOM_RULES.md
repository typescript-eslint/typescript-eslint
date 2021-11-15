---
id: custom-rules
sidebar_label: Custom Rules
title: Custom Rules
---

:::important
You should be familiar with [ESLint's developer guide](https://eslint.org/docs/developer-guide) and [Development > Architecture](./architecture/asts) before writing custom rules.
:::

As long as you are using `@typescript-eslint/parser` as the `parser` in your ESLint configuration, custom ESLint rules generally work the same way for JavaScript and TypeScript code.
The main two changes to custom rules writing are:

- [AST Extensions](#ast-extensions): targeting TypeScript-specific syntax in your rule selectors
- [Typed Rules](#typed-rules): using the TypeScript type checker to inform rule logic

## AST Extensions

`@typescript-eslint/estree` creates AST nodes for TypeScript syntax with names that begin with `TS`, such as `TSInterfaceDeclaration` and `TSTypeAnnotation`.
These nodes are treated just like any other AST node.
You can query for them in your rule selectors.

This rule written in JavaScript bans interfaces that start with a lower-case letter:

```js
export const rule = {
  create(context) {
    return {
      TSInterfaceDeclaration(node) {
        if (/[a-z]/.test(node.id.name[0])) {
          context.report({
            messageId: 'uppercase',
            node: node.id,
          });
        }
      },
    };
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Interface names should start with an upper-case letter.',
    },
    messages: {
      uppercase: 'Start this name with an upper-case letter.',
    },
    type: 'suggestion',
    schema: [],
  },
};
```

### Writing Rules in TypeScript

The `@typescript-eslint/experimental-utils` package acts as a replacement package for `eslint` that exports all the same objects and types, but with typescript-eslint support.

:::caution
`@types/eslint` types are based on `@types/estree` and do not recognize typescript-eslint nodes and properties.
You should generally not need to import from `eslint` when writing custom typescript-eslint rules in TypeScript.
:::

#### Rule Types

`@typescript-eslint/experimental-utils` exports a `RuleModule` interface that allows specifying generics for:

- `MessageIds`: a union of string literal message IDs that may be reported
- `Options`: what options users may configure for the rule

```ts
import { TSESLint } from '@typescript-eslint/experimental-utils';

export const rule: TSESLint.RuleModule<'uppercase', []> = {
  create(context /* : Readonly<RuleContext<TMessageIds, TOptions>> */) {
    // ...
  },
};
```

For groups of rules that share a common documentation URL, a `RuleCreator` function is exported.
It takes in a function that transforms a rule name into its documentation URL, then returns a function that takes in a rule module object.
The returned function is able to infer message IDs from `meta.messages`.

```ts
import { ESLintUtils } from '@typescript-eslint/experimental-utils';

const createRule = ESLintUtils.RuleCreator(
  name => `https://example.com/rule/${name}`,
);

// Type: const rule: RuleModule<"uppercase", ...>
export const rule = createRule({
  create(context) {
    // ...
  },
  meta: {
    messages: {
      uppercase: 'Start this name with an upper-case letter.',
    },
    // ...
  },
});
```

#### Node Types

TypeScript types for nodes exist in a `TSESTree` namespace exported by `@typescript-eslint/experimental-utils`.
The above rule body could be better written in TypeScript with a type annotation on the `node`:

```ts
import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

// ...

export const rule = createRule({
  create(context) {
    return {
      TSInterfaceDeclaration(node: TSESTree.TSInterfaceDeclaration) {
        // ...
      },
    };
  },
  // ...
});
```

An `AST_NODE_TYPES` enum is exported as well to hold the values for AST node `type` properties.
`TSESTree.Node` is available as union type that uses its `type` member as a discriminant.

For example, checking `node.type` can narrow down the type of the `node`:

```ts
import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

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

## Type Checking

:::tip
Read TypeScript's [Compiler APIs > Using the Type Checker](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#using-the-type-checker) section for how to use a program's type checker.
:::

The biggest addition typescript-eslint brings to ESLint rules is the ability to use TypeScript's type checker APIs.

`@typescript-eslint/experimental-utils` exports an `ESLintUtils` namespace containing a `getParserServices` function that takes in an ESLint context and returns a `parserServices` object.

That `parserServices` object contains:

- `program`: A full TypeScript `ts.Program` object
- `esTreeNodeToTSNodeMap`: Map of `@typescript-eslint/estree` `TSESTree.Node` nodes to their TypeScript `ts.Node` equivalents
- `tsNodeToESTreeNodeMap`: Map of TypeScript `ts.Node` nodes to their `@typescript-eslint/estree` `TSESTree.Node` equivalents

By mapping from ESTree nodes to TypeScript nodes and retrieving the TypeScript program from the parser services, rules are able to ask TypeScript for full type information on those nodes.

This rule bans for-of looping over an enum by using the type-checker via typescript-eslint and TypeScript APIs:

```ts
import { ESLintUtils } from '@typescript-eslint/experimental-utils';
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
        const nodeType = checker.getTypeAtLocation(node);

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

`@typescript-eslint/experimental-utils` exports a `RuleTester` with a similar API to the built-in [ESLint `RuleTester`](https://eslint.org/docs/developer-guide/nodejs-api#ruletester).
It should be provided with the same `parser` and `parserOptions` you would use in your ESLint configuration.

### Testing Untyped Rules

For rules that don't need type information, passing just the `parser` will do:

```ts
import { ESLintUtils } from '@typescript-eslint/experimental-utils';
import rule from './my-rule';

const ruleTester = new ESLintUtils.RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('my-rule', rule {
  valid: [/* ... */],
  invalid: [/* ... */],
});
```

### Testing Typed Rules

For rules that do need type information, `parserOptions` must be passed in as well.
Tests must have at least an absolute `tsconfigRootDir` path provided as well as a relative `project` path from that directory:

```ts
import { ESLintUtils } from '@typescript-eslint/experimental-utils';
import rule from './my-typed-rule';

const ruleTester = new ESLintUtils.RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  }
});

ruleTester.run('my-typed-rule', rule {
  valid: [/* ... */],
  invalid: [/* ... */],
});
```

:::note
For now, `ESLintUtils.RuleTester` requires the following physical files be present on disk for typed rules:

- `tsconfig.json`: tsconfig used as the test "project"
- One of the following two files:
  - `file.ts`: blank test file used for normal TS tests
  - `file.tsx`: blank test file used for tests with `parserOptions: { ecmaFeatures: { jsx: true } }`

:::
