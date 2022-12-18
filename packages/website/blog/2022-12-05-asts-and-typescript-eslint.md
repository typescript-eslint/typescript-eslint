---
authors:
  - image_url: https://www.joshuakgoldberg.com/img/josh.jpg
    name: Josh Goldberg
    title: typescript-eslint Maintainer
    url: https://github.com/JoshuaKGoldberg
description: Describing what an AST (Abstract Syntax Tree) is and why it's useful for ESLint and TypeScript tooling.
slug: asts-and-typescript-eslint
tags: [ast, abstract syntax tree, parser, parsing, prettier]
title: ASTs and typescript-eslint
---

Programmers who work with tools like [ESLint](https://eslint.org) and [Prettier](https://prettier.io) often refer to ASTs.
But what is an AST, why is it useful for these kinds of tools, and how does that interact with ESLint and TypeScript tooling?
Let's dig in!

## What's an AST?

_Static analysis_ tools are those that look at code without running it.
They typically _parse_ code, or transform it from a string into a standard format they can reason about known as an **Abstract Syntax Tree** (AST).
ASTs are called such because although they might contain information on the location of constructs within source code, they are an abstract representation that cares more about the semantic structure.

> In other words, an AST is a description of your code's syntax.

### An Example AST

Take this single line of code:

```js
1 + 2;
```

ESLint's AST format, **[ESTree]**, would describe that line of code as an object like:

```json
{
  "type": "ExpressionStatement",
  "expression": {
    "type": "BinaryExpression",
    "left": {
      "type": "Literal",
      "value": 1,
      "raw": "1"
    },
    "operator": "+",
    "right": {
      "type": "Literal",
      "value": 2,
      "raw": "2"
    }
  }
}
```

Each piece of code described within an AST description is referred to as a **node**, or AST node.
Each node is given a **node type** indicating the type of code syntax it represents
That code snippet includes four nodes of the following types:

- _ExpressionStatement_: `1 + 2;`
- _BinaryExpression_: `1 + 2`
- _Literal_: `1`
- _Literal_: `2`

That ESTree object representation of the code is what static analysis tools such as [ESLint](https://eslint.org) and [Prettier](https://prettier.io) work with.

## AST Formats

ESTree is more broadly used than just for ESLint -- it is a popular community standard.
ESLint's built-in parser that outputs an ESTree-shaped AST is also a separate package, called **[Espree]**.

TypeScript has its own separate AST format, often referred to as the TypeScript AST.
Because TypeScript is developed separately and with different goals from ESLint, ESTree, and Espree, its AST also represents nodes differently in many cases.

- TS's AST is optimized for its use case of parsing incomplete code and typechecking.
- ESTree is unoptimized and intended for "general purpose" use-cases of traversing the AST.

ESLint rules are by default only given nodes in the ESTree AST format - which has no knowledge of TypeScript-specific syntax such as interfaces.
On the other hand, TypeScript's type checking APIs require nodes in the TypeScript AST format.

### Enter TSESTree

To resolve the incompatibilities between ESTrees and the TypeScript AST typescript-eslint provides its own [`@typescript-eslint/parser` package](https://typescript-eslint.io/architecture/Parser.mdx) which:

1. First parses TypeScript syntax into a TypeScript AST
1. Creates an ESTree AST based on that TypeScript AST
1. Keeps track of equivalent nodes across each AST

By creating both an ESTree AST and a TypeScript AST, the typescript-eslint parser allows ESLint rules to work with TypeScript code.
That's why the [Getting Started guide](https://typescript-eslint.io/getting-started) for typescript-eslint has you specify `parser: '@typescript-eslint/parser'` in your ESLint config!

We commonly refer to the ESTree format that also includes TypeScript-specific syntax as **TSESTree**.

### AST Playground

The [typescript-eslint playground](https://typescript-eslint.io/play#showAST=es) contains an AST explorer that generates an interactive AST for any code entered into the playground.
You can activate it under _Options_ > _AST Explorer_ on its left sidebar by selecting the value of _AST Viewer_.

## Further Resources

You can play more with various other ASTs on [astexplorer.net], including those for other languages such as CSS and HTML.

The [AST Wikipedia article](https://en.wikipedia.org/wiki/Abstract_syntax_tree) has a great deal more context and history on ASTs.

### Glossary

Putting together all the terms introduces in this article:

- **AST (Abstract Syntax Tree)**: An object representation of your code's syntax.
- **Espree**: ESLint's built-in parser that outputs an ESTree-shaped AST.
- **ESTree**: The AST specification used by ESLint and other common JavaScript tools.
- **Node Type**: What kind of code syntax an AST node refers to, such as _BinaryExpression_ or _Literal_.
- **Node**: A single range of code syntax in an AST.
- **Parser**: A tool that reads in a string and outputs an AST.
- **TSESTree**: Our extension to the ESTree AST format that also includes TypeScript-specific syntax.

### TypeScript Lint Rules and ASTs

Interested in how these ASTs work with ESLint rules?
We collaborated with our friends at Sourcegraph on a [Tour de Source on typescript-eslint](https://sourcegraph.com/notebooks/Tm90ZWJvb2s6MTA2OA==).
Read on to learn how ESLint rules use ASTs to analyze code files and, thanks to `@typescript-eslint/parser`, call TypeScript's type checking APIs to analyze code.

[astexplorer.net]: https://astexplorer.net
[espree]: https://github.com/eslint/espree
[estree]: https://github.com/ESTree/ESTree
