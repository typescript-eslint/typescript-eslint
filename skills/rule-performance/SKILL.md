---
name: rule-performance
description: Find and apply performance wins in typed lint rules by deferring expensive TypeScript type lookups behind cheap AST/syntactic guards. Use when writing or reviewing a rule in packages/eslint-plugin that calls the type checker.
---

# Deferring type checks in lint rules

Type-aware rules are the main source of lint slowdowns, because calls into TypeScript's checker (`getTypeAtLocation`, `getConstrainedTypeAtLocation`,
`checker.getTypeAtLocation`, `getTypeName`, etc.) are far more expensive than
reading the AST that the parser already produced.

A rule visitor often combines two kinds of conditions:

- **Syntactic / AST checks** — node types, operators, flags, parent shape,
  option values. These are essentially free: the data already exists in memory.
- **Type checks** — anything that asks the checker for a `Type` and then
  inspects it. These can trigger lazy type resolution and are the expensive part.

The win is almost always the same: **make sure every cheap check that can reject
a node runs _before_ the first expensive type lookup.** When a syntactic guard
can short-circuit the visitor, a type lookup that would have been thrown away
never happens.

This preference is hard to enforce with a lint rule of our own (the ordering is
semantically equivalent, so there's nothing "wrong" to flag), which is exactly
why it's a good fit for an agent skill.

## When to use

Use this when authoring a new rule in `packages/eslint-plugin/src/rules`, or
when reviewing/refactoring an existing one, and the visitor calls the type
checker. It is most impactful on visitors that fire on very common node types
(binary expressions, member expressions, calls), since those run constantly.

## How to find candidates

1. In each rule visitor, locate the first call that retrieves a type. Common
   names: `getTypeAtLocation`, `getConstrainedTypeAtLocation`,
   `services.getTypeAtLocation`, `checker.getTypeAtLocation`, `getTypeName`,
   and helpers built on top of them.
2. Look at every check that comes _after_ it and could return / `continue` /
   skip the node. Ask: does this check read only the AST (node type, operator,
   parent, option, a flag), with no dependency on the type value?
3. If yes, that check is a candidate to move _above_ the type lookup.

## How to apply

Reorder so the cheap, type-independent guard runs first. The behavior must be
identical — you are only changing _when_ the type is fetched, never _whether_
the node is reported.

Before — the type is fetched even for nodes the AST guard would reject:

```ts
const type = getConstrainedTypeAtLocation(services, node);
if (!tsutils.isTypeFlagSet(type, ts.TypeFlags.VoidLike)) {
  return;
}

const invalidAncestor = findInvalidAncestor(node); // pure AST walk
if (invalidAncestor == null) {
  return;
}
```

After — the AST guard rejects first, so the type lookup only runs when it's
actually needed:

```ts
const invalidAncestor = findInvalidAncestor(node); // pure AST walk
if (invalidAncestor == null) {
  return;
}

const type = getConstrainedTypeAtLocation(services, node);
if (!tsutils.isTypeFlagSet(type, ts.TypeFlags.VoidLike)) {
  return;
}
```

Sometimes the cheap and expensive conditions are combined in one `&&`. Order the
operands so the cheap one is evaluated first and can short-circuit:

```ts
// Before: getTypeName runs before the free node-type check
} else if (
  getTypeName(checker, rightType) === 'string' &&
  node.left.type !== AST_NODE_TYPES.PrivateIdentifier
) {

// After: the free check short-circuits before getTypeName
} else if (
  node.left.type !== AST_NODE_TYPES.PrivateIdentifier &&
  getTypeName(checker, rightType) === 'string'
) {
```

## Things to verify before claiming a win

- **No behavior change.** Reordering must not change what the rule reports.
  Re-run the rule's existing tests; they should pass unchanged. If a test would
  need editing, the reorder changed behavior and is wrong.
- **No side effects between the moved lines.** If the type lookup populated a
  cache/variable used later, or a guard had a side effect, preserve ordering of
  those effects.
- **The guard is genuinely cheaper.** Moving one type lookup ahead of another
  type lookup is not a win. The point is AST-only guards jumping ahead of type
  lookups.
- **The guard can actually reject.** Reordering only helps when the cheap check
  sometimes short-circuits. If it never rejects in practice, there's no win.
- **Measure when in doubt.** Benchmark with `hyperfine` against
  `packages/eslint-plugin` (or a representative project). Gains are typically a
  few percent per rule, so verify rather than assume.

## Reference

- Pattern origin: PR #12296 (defer type checks to improve rule performance) and
  issue #12370.
- [Performance troubleshooting docs](../../docs/troubleshooting/typed-linting/Performance.mdx).
