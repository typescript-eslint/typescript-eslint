---
name: code-clarity
description: Remove the unnecessary intermediate variables, restating comments, redundant type annotations, and imprecise names that make code longer without making it clearer. Use when writing or reviewing any TypeScript in this repository, especially code written with an AI agent's help.
---

# Keeping code direct

These are nits: offer a suggestion, don't block on them. The exception is a comment that restates code, since a stale comment misleads.

## Don't store a value used once

Before:

```ts
const parent = node.parent;
if (
  parent.type === AST_NODE_TYPES.BinaryExpression &&
  parent.operator === '==='
) {
```

After:

```ts
if (
  node.parent.type === AST_NODE_TYPES.BinaryExpression &&
  node.parent.operator === '==='
) {
```

Keep the variable when it is read more than once, when repeating the expression would be long, or when the name explains a computation the expression does not.

Keep it when it holds a **type-narrowed** value — that is a legitimate way around limits in TypeScript's control flow analysis. If removing it introduces a type error, leave it.

Lowest priority in this skill: many instances merge without comment. Raise it once, never twice.

## Declare variables where they are first needed

A declaration above a guard that returns does work the guard would have skipped.

Before:

```ts
const elementIndex = parent.elements.indexOf(node);

const sourceType = getSourceTypeForPattern(parent);
if (!sourceType || !checker.isTupleType(sourceType)) {
  return;
}
```

After:

```ts
const sourceType = getSourceTypeForPattern(parent);
if (!sourceType || !checker.isTupleType(sourceType)) {
  return;
}

const elementIndex = parent.elements.indexOf(node);
```

Same for object construction: build a suggestion descriptor or fixer inside the branch that reports, not above the check deciding whether to report.

## Prefer an early return to a wrapping `if`

When a function body is mostly one branch, invert the condition and return.

## Let `const` infer, and skip return types on local functions

```ts
// Before
const FLAG_CONFIGS: Record<FlagType, FlagConfig> = {

// After
const FLAG_CONFIGS = {
```

Explicit return types on non-exported functions are not enforced here; leave them off, especially unions and deep object literals. Annotate exported functions and public API types — their types are the contract.

## Avoid `let` when a ternary will do

Before:

```ts
let propertyName: string;

if (propertyType.isStringLiteral()) {
  propertyName = propertyType.value;
} else {
  propertyName = String(propertyType.value as number);
}
```

After:

```ts
const propertyName = propertyType.isStringLiteral()
  ? propertyType.value
  : String(propertyType.value as number);
```

A `let` reassigned across several branches, or accumulated in a loop, is fine. The target is the two-branch assignment.

## Delete comments that restate the code

Nothing verifies a comment, so it drifts out of date and then misleads.

```ts
// Handle destructuring patterns
if (parent.type === AST_NODE_TYPES.Property) {
  // This is a property in an object destructuring pattern
  const objectPattern = parent.parent as TSESTree.ObjectPattern;
```

The types already say the parent is a property and its parent an object pattern.

This is the most frequent request in review, so check every added comment in a diff deliberately. Four recur:

- a label above a **test case** describing what it covers;
- the **issue a regression case came from** (`// Regression for #11946: …`) where the case is self-explanatory;
- a **section label** inside a function (`// Handle destructuring patterns`);
- a restatement of the **line directly below**.

Keep comments that explain a non-obvious _why_: a workaround, an external constraint, a subtle invariant, a magic value's origin (`severity: 8, // MarkerSeverity.Error`). See [`docs-writing`](../docs-writing/SKILL.md) for TODOs and for never leaving a guess in a comment.

Leave the comment alone when the code it describes is genuinely intricate — a reader newer to these AST types may need it.

## Name things fully and accurately

- **No abbreviations.** `expr` → `expression`, `prop` → `property`.
- **The name matches what the code does.** A function checking a callee's name is `isKnownSafePromiseCall`, not `isKnownSafePromiseReturn`. Renaming a type renames the function returning it.
- **No numeric suffixes.** Name the difference: `afterNodeTestCommentsInsideParenthesis` / `…OutsideParenthesis`, not `…1` / `…2`.
- **No mid-word capitals.** `getInterSectionTypePart` — the S does not start a word.
- **No magic strings or numbers.** Name the value, or comment where it came from.
