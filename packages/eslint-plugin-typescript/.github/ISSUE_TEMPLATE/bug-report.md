---
name: Bug report
about: Report an issue
labels: 

---

<!--
If you have a problem with a specific rule, please begin your issue title with [rulename] to make it easier to search for.
I.e. "[no-unused-vars] False positive when fooing the bar" 
-->

**Repro**
<!--
Include a minimal reproduction case.
Please try to avoid code that isn't directly related to the bug, as it makes it harder to investigate.
-->
```JSON
{
  "rules": {
    "typescript/<rule>": "<setting>"
  }
}
```

```TS
// your repro code case
```


**Expected Result**


**Actual Result**



**Additional Info**



** Versions **
| package                    | version |
| -------------------------- | ------- |
| `eslint-plugin-typescript` | `X.Y.Z` |
| `typescript-eslint-parser` | `X.Y.Z` |
| `typescript`               | `X.Y.Z` |
