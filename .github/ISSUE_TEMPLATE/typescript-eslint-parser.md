---
name: '@typescript-eslint/parser'
about: Report an issue with the '@typescript-eslint/parser' package
title: ''
labels: 'package: parser, triage'
assignees: ''
---

<!--
Please don't ignore this template.

If you ignore it, we're just going to respond asking you to fill it out, which wastes everyone's time.
The more relevant information you can include, the faster we can find the issue and fix it without asking you for more info.
-->

**Repro**

<!--
Include a ***minimal*** reproduction case.
The more irrelevant code/config you give, the harder it is for us to investigate.
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

**Expected Result**

**Actual Result**

**Additional Info**

<!--
Did eslint throw an exception?

Please run your lint again with the --debug flag, and dump the output below.
i.e. eslint --ext ".ts,.js" src --debug
-->

**Versions**

| package                     | version |
| --------------------------- | ------- |
| `@typescript-eslint/parser` | `X.Y.Z` |
| `TypeScript`                | `X.Y.Z` |
| `ESLint`                    | `X.Y.Z` |
| `node`                      | `X.Y.Z` |
| `npm`                       | `X.Y.Z` |
