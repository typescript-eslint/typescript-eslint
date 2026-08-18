---
name: types-not-workarounds
description: Fix imprecise types at their source instead of papering over them with runtime checks, assertion helpers, or `in` narrowing. Use when reviewing or writing code that adds a guard, an assertion, or an optional chain only to satisfy the type checker.
---

# Fixing types at the source

A guard that exists to satisfy the type checker rather than to handle a real runtime case is a surface-level fix for a deeper problem. It adds code, adds an untested branch, and leaves the wrong type in place for the next caller.

When a value's type is less specific than the code knows it to be, the question to ask is not _"how do I convince the checker here?"_ but _"which type is wrong, and where?"_

## Narrow the parameter, not the body

If a function is only ever called with a narrower type than its signature says, change the signature.

Before — the assertion is inside the function, so every future caller can still pass the wrong thing:

```ts
function createPropertyKeyFixer(node: TSESTree.Node) {
  const operator = node.parent as TSESTree.TSTypeOperator;
```

After — the type states the requirement, and the assertion disappears:

```ts
function createPropertyKeyFixer(node: TSESTree.TSAnyKeyword) {
  const operator = node.parent;
```

When the constraint is the presence of a property rather than a whole node type, [`MakeRequired`](../../../packages/eslint-plugin/src/util/types.ts) — imported from `'../util'` — says exactly that:

```ts
type ModuleDeclarationWithBody = MakeRequired<
  TSESTree.TSModuleDeclaration,
  'body'
>;
```

Narrowing the parameter this way often deletes a `nullThrows` further down as well.

## `!` when the type is wrong, not `?.`

`node.parent` is defined for every node except `Program`. When the code provably cannot be looking at `Program`, `?.` adds runtime logic for a case that cannot happen, and quietly makes the impossible branch untestable. `!` states that the type is wrong; the optional chain pretends it is right.

```ts
// The types allow `undefined` here, but this is never `Program`.
const grandparent = node.parent.parent!;
```

Then go one step further: work out _which_ type is too loose and file an issue for it. The `node.parent` family of imprecision is a recurring headache — [#6225](https://github.com/typescript-eslint/typescript-eslint/issues/6225), [#10682](https://github.com/typescript-eslint/typescript-eslint/issues/10682), [#11334](https://github.com/typescript-eslint/typescript-eslint/issues/11334) — and each report is what eventually lets the assertions be deleted. Hovering the value, or a [twoslash query](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-twoslash-queries), shows which member of the union carries the looser type.

## Don't add runtime assertion helpers

An `assert(...)` call that exists to narrow a type is the same workaround wearing a different hat. Values should be their expected type before being used.

Given `memberTsNode: ts.MethodDeclaration | ts.PropertyDeclaration`, an `assert(ts.isClassLike(memberTsNode.parent))` says the parent type is unreliable. One of two things is true, and both are fixable at the type level:

- the parent always _is_ a `ts.ClassLikeDeclaration`, so the AST types should say so; or
- it is not always, so the parameter should be typed `{ parent: ts.ClassLikeDeclaration }` and callers made to prove it.

The same reasoning applies to a standalone `getParameterPropertyIdentifier`-style helper whose only job is to re-assert what the AST types should already guarantee.

## Don't use `in` to narrow AST nodes

`'name' in node` narrows by shape rather than by discriminant, so it silently accepts node types you never considered — and [`eslint-plugin-eslint-plugin/no-property-in-node`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/main/docs/rules/no-property-in-node.md) exists to catch it. TSESTree nodes are a discriminated union; switch on `node.type`.

Before:

```ts
if ('name' in node && typeof node.name === 'string') {
```

After — the caller only ever passes these, so the parameter type can say so and the checks vanish:

```ts
function valueMatchesSpecifier(
  node: TSESTree.Identifier | TSESTree.JSXIdentifier,
): boolean {
  // node.name is `string` here with no check at all
```

## Prefer the TSESTree AST to TypeScript's

We define TSESTree, so we can make it more specific than TypeScript's AST — and we define it as a discriminated union, which is what makes `node.type` narrowing work. A typed rule should take a TSESTree node and, where it needs type information, a `services: ParserServicesWithTypeInformation`, using `services.getTypeAtLocation` and `services.getSymbolAtLocation` rather than reaching for the checker directly.

Reaching into `services.esTreeNodeToTSNodeMap` is normal when an API only exists on TypeScript's side. Threading a `TSESTreeToTSNode<...>` through a signature to prove a correspondence is not — a plain `TSESTree.Expression` is enough.

## Exceptions

- **`as` is a legitimate tool here.** When the checker is wrong about `node.parent` and the narrower type cannot be expressed, an assertion plus a followup issue is the accepted outcome, not a defect.
- **Storing a narrowed value is not a workaround.** Refactoring to hold a narrowed value in a variable is a normal way around gaps in [control flow analysis](https://github.com/microsoft/TypeScript/issues/9998). Don't flag it as an unnecessary variable.
- **Existing `?.` cruft stays.** Plenty of older code uses `?.` where `!` belongs. That gets cleaned up when the underlying types are fixed, not in an unrelated PR.
- **A guard that handles a real case is not a workaround.** Before requesting removal, confirm the branch is genuinely unreachable — see the coverage procedure in [`tests`](../tests/SKILL.md).
