---
id: asts
sidebar_label: 'ASTs'
---

# Abstract Syntax Trees (ASTs)

Parsers such as those in ESLint and TypeScript read in the text of source code and parse it into a standard format they can reason about known as an **Abstract Syntax Tree** (AST).
ASTs are called such because although they might contain information on the location of constructs within source code, they are an abstract representation that cares more about the semantic structure.

For example, given this line of code:

```js
1 + 2;
```

ESLint would natively understand it as an object like:

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

ESLint uses an AST format known as **[`estree`]**.

ESTree is more broadly used than just for ESLint -- it is the de facto community standard.
ESLint's built-in parser that outputs an `estree`-shaped AST is also a separate package, called **[`espree`]**.

## AST Playground

The [TypeScript ESLint playground](https://typescript-eslint.io/play#showAST=es) contains an AST explorer that generates an interactive AST for any code entered into the playground.
You can activate it under _Options_ > _AST Explorer_ on its left sidebar by selecting _ESTree_.

:::note

You can play more with various other ASTs on [astexplorer.net] and read more details on their [Wikipedia article](https://en.wikipedia.org/wiki/Abstract_syntax_tree).

:::

[astexplorer.net]: https://astexplorer.net
[`espree`]: https://github.com/eslint/espree
[`estree`]: https://github.com/estree/estree
