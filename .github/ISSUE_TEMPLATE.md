---
name: catch-all template
about: Provides some general structure to issues that people choose to log outside the normal flow
title: ''
labels: triage
assignees: ''
---

<!--
Please don't ignore this template.

If you ignore it, we're just going to respond asking you to fill it out, which wastes everyone's time.
The more relevant information you can include, the faster we can find the issue and fix it without asking you for more info.
-->

- [ ] I have tried restarting my IDE and the issue persists.
- [ ] I have updated to the latest version of the packages.
- [ ] I have [read the FAQ](https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/FAQ.md) and my problem is not listed.

**Repro**

<!--
Include a ***minimal*** reproduction case.
The more irrelevant code/config you give, the harder it is for us to investigate.

Please consider creating an isolated reproduction repo to make it easy for the volunteer maintainers debug your issue.
-->

```JSON
{
  "rules": {
    "@typescript-eslint/<rule>": ["<setting>"]
  }
}
```

```TS
// your repro code case
```

<!--
Also include your tsconfig, if you're using type-aware linting
-->

**Expected Result**

<!--
What did you expect to happen?
Please be specific here - list the exact lines and messages you expect.
-->

**Actual Result**

<!--
What actually happened?
Please be specific here - list the exact lines and messages that caused errors
-->

**Additional Info**

<!--
Did eslint throw an exception?

Please run your lint again with the --debug flag, and dump the output below.
i.e. eslint --ext ".ts,.js" src --debug
-->

**Versions**

| package                                 | version |
| --------------------------------------- | ------- |
| `@typescript-eslint/eslint-plugin`      | `X.Y.Z` |
| `@typescript-eslint/parser`             | `X.Y.Z` |
| `@typescript-eslint/typescript-estree`  | `X.Y.Z` |
| `@typescript-eslint/experimental-utils` | `X.Y.Z` |
| `TypeScript`                            | `X.Y.Z` |
| `node`                                  | `X.Y.Z` |
| `npm`                                   | `X.Y.Z` |
