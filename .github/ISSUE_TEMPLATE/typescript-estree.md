---
name: '@typescript-eslint/typescript-estree'
about: Report an issue with the '@typescript-eslint/typescript-estree' package
title: ''
labels: 'package: typescript-estree, triage'
assignees: ''
---

<!--
Please don't ignore this template.

If you ignore it, we're just going to respond asking you to fill it out, which wastes everyone's time.
The more relevant information you can include, the faster we can find the issue and fix it without asking you for more info.
-->

<!--
Make sure you read through our FAQ before posting.
https://github.com/typescript-eslint/typescript-eslint/blob/issue-template-update/docs/getting-started/linting/FAQ.md
-->

**Repro**

<!--
Include a ***minimal*** reproduction case.
The more irrelevant code/config you give, the harder it is for us to investigate.

Feel free to omit the eslint config if you are not using this module via ESLint.
-->

```JSON
{
  "rules": {
    "@typescript-eslint/<rule>": ["<setting>"]
  },
  "parserOptions": {
    "...": "something"
  }
}
```

```TS
// your repro code case
```

**Expected Result**

**Actual Result**

**Additional Info**

<!--
Did eslint throw an exception?

Please run your lint again with the --debug flag, and dump the output below.
i.e. eslint --ext ".ts,.js" src --debug
-->

**Versions**

| package                                | version |
| -------------------------------------- | ------- |
| `@typescript-eslint/typescript-estree` | `X.Y.Z` |
| `TypeScript`                           | `X.Y.Z` |
| `node`                                 | `X.Y.Z` |
| `npm`                                  | `X.Y.Z` |
