---
name: shared-logic
description: Move logic copied between rules into a shared util, reuse the utils that already exist instead of reimplementing them, and migrate call sites when adding a new one. Use when a PR adds a non-trivial helper function to a rule, or reimplements type or AST logic that type-utils already provides.
---

# Sharing logic between rules

Two copies of tricky type logic drift apart: one gets a bug fix, the other doesn't, and the second bug surfaces months later.

## Copied rule logic goes into a util

The target is **a non-trivial helper function duplicated between rules** — not duplication in general. Move it to a shared file and have both rules import it. That case is a change request, not a nit.

Signals:

- it appears in the diff and also, near-verbatim, in another rule under `packages/eslint-plugin/src/rules`;
- it carries the same explanatory comments as its twin;
- it answers a question any rule might ask — _"does this class extend a specified base?"_, _"is this expression higher precedence than `await`?"_

Consider placing these, in order of scope: `packages/eslint-plugin/src/util` for rule helpers, `packages/type-utils/src` for anything about `ts.Type`, `packages/utils/src` for what plugin consumers need too.

**This does not extend to repeated boilerplate outside rule logic.** Identical blocks across package entry points, near-identical CI jobs, parallel config files, and repeated test scaffolding are normal here and are not raised in review. Flag duplication only when both copies are logic that could drift apart into a bug.

## When copies differ, parameterize

Two helpers that are _almost_ the same still deduplicate — the difference becomes an argument.

Two rules each answered _"is this type, or any of its base types, allowed?"_, one matching a legacy name list and one a `TypeOrValueSpecifier`. The shared version takes the matcher:

```ts
export function matchesTypeOrBaseType(
  services: ParserServicesWithTypeInformation,
  matcher: (type: ts.Type) => boolean,
  type: ts.Type,
  seen = new Set<ts.Type>(),
): boolean {
```

```ts
// no-base-to-string.ts
matchesTypeOrBaseType(
  services,
  type => ignoredTypeNames.includes(getTypeName(checker, type)),
  type,
);

// restrict-template-expressions.ts
matchesTypeOrBaseType(
  services,
  type => typeMatchesSomeSpecifier(type, allow, program),
  type,
);
```

Two functions only ever called as a pair are one function, not two exports.

## Reach for the util that already exists

| Question                                                | Use                                                                                                | Not                                                     |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Is this type from the default library?                  | `isSymbolFromDefaultLibrary`, `program.isSourceFileDefaultLibrary`                                 | a filename check, which `./src/gotcha.lib.d.ts` defeats |
| Does this type or value match a user-configured target? | [`TypeOrValueSpecifier`](https://typescript-eslint.io/packages/type-utils/type-or-value-specifier) | comparing names, which matches coincidentally           |
| What is this computed key's value?                      | `getStaticValue`, `getStaticMemberAccessValue`                                                     | handling only literals                                  |
| Is this a definition file?                              | the same expression TypeScript itself uses                                                         | an approximation                                        |

Name matching deserves particular suspicion: matching an identifier's name does not check where it came from, so the declaration has to be resolved too, via the scope manager or the type checker. Rule-specific matching logic belongs in `type-utils`, not in one rule.

## A new util needs its call sites

A helper added with no callers is untested and unproven. Find the existing code it replaces and convert it in the same PR — at minimum the straightforward cases.

```diff
-      if (functionTSNode.type) {
-        const returnType = checker.getTypeFromTypeNode(functionTSNode.type);
+      if (functionNode.returnType) {
+        const returnType = services.getTypeFromTypeNode(
+          functionNode.returnType.typeAnnotation,
+        );
```

## Generalize what is publicly exported

A util exported from `@typescript-eslint/type-utils` or `@typescript-eslint/utils` is public API, so it must handle more than the rule that prompted it. A helper covering only `Identifier` and `JSXIdentifier` is fine while internal; once exported it needs private properties, computed keys, and the rest — or a narrower parameter type so callers cannot pass what it does not handle.

## Exceptions

- **Don't deduplicate a one-liner.** Extract logic long enough to hold a bug.
- **Small, single-purpose fixtures and test helpers stay local.**
- **Don't churn unrelated rules.** If converting every call site would balloon the diff, convert the straightforward ones and note the rest for a followup.
- **A near-duplicate needing three flags to unify is two functions.**
