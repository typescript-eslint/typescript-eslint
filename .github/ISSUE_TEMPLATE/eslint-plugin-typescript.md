---
name: "@typescript-eslint/eslint-plugin"
about: Report an issue with the '@typescript-eslint/eslint-plugin' package
title: "[rulename] <issue title>"
labels: 'package: eslint-plugin, triage'
assignees: ''

---

<!--
If you have a problem with a specific rule, please begin your issue title with [rulename] to make it easier to search for.
I.e. "[no-unused-vars] False positive when fooing the bar"

Please don't ignore this template.

If you ignore it, we're just going to respond asking you to fill it out, which wastes everyone's time.
The more relevant information you can include, the faster we can find the issue and fix it without asking you for more info.
-->

<!--
Are you opening an issue because the rule you're trying to use is not found?
🚨 STOP 🚨 𝗦𝗧𝗢𝗣 🚨 𝑺𝑻𝑶𝑷 🚨
1) Check the releases log: https://github.com/typescript-eslint/typescript-eslint/releases
    -  If the rule isn't listed there, then chances are it hasn't been released to the main npm tag yet.
2) Try installing the `canary` tag: `npm i @typescript-eslint/eslint-plugin@canary`.
    - The canary tag is built for every commit to master, so it contains the bleeding edge build. 
3) If ESLint still can't find the rule, then consider reporting an issue.
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

| package                            | version |
| ---------------------------------- | ------- |
| `@typescript-eslint/eslint-plugin` | `X.Y.Z` |
| `@typescript-eslint/parser`        | `X.Y.Z` |
| `TypeScript`                       | `X.Y.Z` |
| `ESLint`                           | `X.Y.Z` |
| `node`                             | `X.Y.Z` |
| `npm`                              | `X.Y.Z` |
