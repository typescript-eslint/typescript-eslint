---
name: code-clarity
description: Remove the unnecessary intermediate variables, restating comments, redundant type annotations, and imprecise names that make code longer without making it clearer. Use when writing or reviewing any TypeScript in this repository, especially code written with an AI agent's help.
---

# Keeping code direct

Code in this repository is read far more often than it is written, usually by someone debugging a rule they did not author. Every line that exists without earning its place is a line that reader has to hold.

The patterns below come up constantly in review. They are individually small — most are worth mentioning as a nit rather than blocking on — but they compound, and agent-written code produces them at a much higher rate than hand-written code does.

## Don't store a value used once

A variable that holds a single property access or call, and is then read one time, adds a line and a name without adding meaning. Read the value where it is used.

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

Keep the variable when it is read more than once, when the expression is long enough that repeating it hurts, or when the name explains a computation the expression does not — `const isCastTypeLiteral = isTypeLiteral(castType);` earns its place if it is used twice, and avoids a repeated call into TypeScript's type methods.

Keep it, too, when the variable exists to hold a **type-narrowed** value. Storing a narrowed value is a legitimate way around limits in TypeScript's control flow analysis, not clutter. If removing the variable introduces a type error, that is the signal to leave it.

Treat this as the lowest-priority item in this skill. It shows up constantly in agent-written code and is worth mentioning while you are already reviewing a function, but plenty of instances get merged without comment — so raise it once with a suggestion and never twice.

## Declare variables where they are first needed

A declaration above a guard that returns runs work the guard would have made unnecessary, and separates the name from its use.

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

The same applies to constructing objects — build a suggestion descriptor or fixer inside the branch that reports it, not above the check that decides whether to report at all.

## Prefer an early return to a wrapping `if`

When a function's body is mostly one branch, invert the condition and return, so the main path is not indented under a check.

## Let `const` infer, and skip return types on local functions

TypeScript reports a mismatch without being told the type. An annotation that restates what inference already produces is syntax to read and a second place to update.

```ts
// Before
const FLAG_CONFIGS: Record<FlagType, FlagConfig> = {

// After
const FLAG_CONFIGS = {
```

Explicit return types on non-exported functions have not been enforced here in a while. Non-trivial ones — a union, or a deep object literal — take up a lot of space and make the function harder to read, so leave them off. Exported functions and public API types are the opposite case: annotate those, because their types are the contract.

## Avoid `let` when a ternary or a restructure will do

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

A `let` reassigned across several branches, or accumulated in a loop, is fine. The target is the two-branch assignment that a ternary states in one expression.

## Write comments that say what the code cannot

A comment restating the line below it is not neutral: nothing verifies it, so it drifts out of date and then actively misleads. Delete it.

```ts
// Handle destructuring patterns
if (parent.type === AST_NODE_TYPES.Property) {
  // This is a property in an object destructuring pattern
  const objectPattern = parent.parent as TSESTree.ObjectPattern;
```

Both comments here restate their code. The types already say that the parent is a property and its parent an object pattern.

This is the single most frequent request in review, so check for it deliberately rather than waiting to notice one. Every added comment in a diff is a candidate, and these four keep recurring:

- a comment above a **test case** describing what the case covers — the case already shows it, and the label goes stale;
- a comment naming the **issue a regression case came from** (`// Regression for #11946: …`) where the case is self-explanatory;
- a **section label** inside a function (`// Handle destructuring patterns`) sitting above code whose types say the same thing;
- a comment restating the **line directly below it**.

Deleting a comment you were about to keep is the expected outcome here.

Comments that do belong explain a non-obvious _why_: a workaround, an external constraint, a subtle invariant, or a magic value's origin — `severity: 8, // MarkerSeverity.Error`. See [`docs-writing`](../docs-writing/SKILL.md) for TODO comments and for never leaving a guess in a comment.

## Name things fully and accurately

- **No abbreviations.** `expr` becomes `expression`, `prop` becomes `property`. Abbreviations make code harder to read for a meaningful share of contributors.
- **The name must match what the code does.** When logic changes, the name changes with it: a function that checks a callee's name is not `isKnownSafePromiseReturn`, it is `isKnownSafePromiseCall`. Renaming a type renames the function that returns it.
- **No numeric suffixes.** `afterNodeTestComments1` and `afterNodeTestComments2` differ in a way the reader has to reconstruct; name the difference — `afterNodeTestCommentsInsideParenthesis` and `…OutsideParenthesis`.
- **Watch the casing.** `getInterSectionTypePart` capitalizes mid-word; the S does not start a new word.
- **No magic strings or numbers.** Give the value a name, or a comment pointing at where it came from. A reader should not have to find-all to learn where a literal originated.

## Register

These are nits. Say so, offer the suggestion, and don't block a PR on them — the author's time is usually better spent on correctness. The one to hold firm on is a comment that restates code, because a wrong comment is worse than no comment.

Note also that people who have not spent years in these AST types may reasonably find a comment helpful where a maintainer finds it obvious. When the code being described is genuinely intricate, leave the comment alone.
