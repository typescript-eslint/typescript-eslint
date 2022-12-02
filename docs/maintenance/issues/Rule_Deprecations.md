---
id: rule-deprecations
title: Rule Deprecations
---

Sometimes a rule that used to be 👍 does not age well and becomes 👎.
In the past, these cases have included:

- Overly opinionated and/or stylistic rules that don't represent a universal best practice
- Renames
- Rules moved to an external plugin

In these cases, we aim to remove the old rule with minimal user disruption.

## Filing the Issue

Rule deprecations can be filed as a [new issue bypassing templates](https://github.com/typescript-eslint/typescript-eslint/issues/new).

Provide it an `## Overview` containing:

- The rule name & link to its documentation page
- A clear explanation of why you believe it should be deprecated
- Whether it exists in popular configs such as `eslint-config-airbnb-typescript` and `eslint-config-standard-with-typescript`
- Sourcegraph queries showing how often it appears in user configs

> See [#6036](https://github.com/typescript-eslint/typescript-eslint/issues/6036) for examples of those links and queries.

## Timeline

1. In any minor/patch version, add [rule `meta` properties](https://eslint.org/docs/latest/developer-guide/working-with-rules#rule-basics):
   - `deprecated: true`
   - `replacedBy`, if applicable
2. In the next major version, you may delete the rule
   - If the rule is relatively popular with users, consider leaving a documentation page pointing to relevant docs
