---
id: versioning
sidebar_label: Versioning
title: Versioning
---

We follow [semantic versioning (semver)](https://semver.org).
This page exists to help set guidelines around when what we consider to fall within each of the semver categories.

All of the packages in this project are published with the same version number to make it easier to coordinate both releases and installations.

When considering whether a change should be counted as "breaking" we first need to consider what package(s) it impacts. For example breaking changes for the parser packages have a different standard to those for the ESLint plugins. This is because not only do they have _very_ different API surfaces, they also are consumed in very different ways.

Please note that the lists provided below are non-exhaustive and are intended to serve as examples to help guide maintainers when planning and reviewing changes.

## Internal packages

Any packages in this project that are not part of our public API surface (such as `eslint-plugin-internal` or `website`) shall not be considered when calculating new package versions.

## `ast-spec` and `visitor-keys`

A change to the AST **_shall_** be considered breaking if it:

- Removes or renames an existing AST Node.
- Removes or renames an existing property on an AST Node.
- Changes a type in a non-refining way (i.e. `string` to `number`).

A change to the AST **_shall not_** be considered breaking if it:

- Adds a new property to the AST.
- Adds a new node type to the AST.
- Adds a new node type to an existing union type.
- Refines a type to be more specific (i.e. `string` to `'literal' | 'union'`).
- Removes a type from a union that was erroneously added and did not match the runtime AST.

## `eslint-plugin` and `eslint-plugin-tslint`

A change to the plugins **_shall_** be considered breaking if it:

- Removes or renames an option.
- Changes the default option of a rule.
- Changes a rule's schema to be stricter.
- Consumes type information to a rule that did not previously consume it.
- Removes or renames a rule.
- Changes any of the recommended configurations.
- Changes the default behavior of a rule in such a way that causes new reports in a large set of cases in an average codebase.

A change to the plugins **_shall not_** be considered breaking if it:

- Adds an option.
- Adds a rule.
- Deprecates a rule.
- Adds additional checks to an existing rule that causes new reports in a small-to-medium set of cases in an average codebase.
- Refactors a rule's code in a way that does not introduce additional reports.
- Changes to a rule's description or other metadata.
- Adds a fixer or suggestion fixer.
- Removes a fixer or suggestion fixer.
- Fixes incorrect behavior in a rule that may or may not introduce additional reports.

### `parser`, `typescript-estree`, `scope-manager`, `types`, `type-utils`, `utils`

A change to these packages **_shall_** be considered breaking if it:

- Changes the API surface in a backwards-incompatible way (remove or rename functions, types, etc).

A change to these packages **_shall not_** be considered breaking if it:

- Adds to the API surface (add functions, types, etc).
- Deprecates parts of the API surface.
- Adds **_optional_** arguments to functions or properties to input types.
- Adds additional properties to output types.
- Adds documentation in the form of JSDoc comments.
