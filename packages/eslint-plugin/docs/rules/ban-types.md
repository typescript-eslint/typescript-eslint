:::danger Deprecated

The old `ban-types` rule encompassed multiple areas of functionality, and so has been split into several rules.

**[`no-restricted-types`](./no-restricted-types.mdx)** is the new rule for banning a configurable list of type names.
It has no options enabled by default.

The default options from `ban-types` are now covered by:

- **[`no-empty-object-type`](./no-empty-object-type)**: banning the built-in `{}` type in confusing locations
- **[`no-wrapper-object-types`](./no-wrapper-object-types.mdx)**: banning built-in class wrappers such as `Number`

`ban-types` itself is removed in typescript-eslint v8.
See [Announcing typescript-eslint v8 Beta](/announcing-typescript-eslint-v8-beta) for more details.
:::

<!-- This doc file has been left on purpose because `camelcase` is a core ESLint
rule. This exists to help direct people to the replacement rule.

Note that there is no actual way to get to this page in the normal navigation,
so end-users will only be able to get to this page from the search bar. -->
