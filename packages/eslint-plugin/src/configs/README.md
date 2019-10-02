# Premade configs

These configs exist for your convenience. They contain configuration intended to save you time and effort when configuring your project by disabling rules known to conflict with this repository, or cause issues in typesript codebases.

## All

TODO when all config is added.

## eslint-recommended

The `eslint-recommended` ruleset is meant to be used after extending `eslint:recommended`. It disables rules that are already checked by the Typescript compiler and enables rules that promote using more the more modern constructs Typescript allows for.

```cjson
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended"
  ]
}
```

## Recommended

The recommended set is an **_opinionated_** set of rules that we think you should use because:

1. They help you adhere to TypeScript best practices.
2. They help catch probable issue vectors in your code.

That being said, it is not the only way to use `@typescript-eslint/eslint-plugin`, nor is it the way that will necesasrily work 100% for your project/company. It has been built based off of two main things:

1. TypeScript best practices collected and collated from places like:
   - [TypeScript repo](https://github.com/Microsoft/TypeScript).
   - [TypeScript documentation](https://www.typescriptlang.org/docs/home.html).
   - The style used by many OSS TypeScript projects.
2. The combined state of community contributed rulesets at the time of creation.

We will not add new rules to the recommended set unless we release a major package version (i.e. it is seen as a breaking change).

### Altering the recommended set to suit your project

If you disagree with a rule (or it disagrees with your codebase), consider using your local config to change the rule config so it works for your project.

```cjson
{
  "extends": ["plugin:@typescript-eslint/recommended"],
  "rules": {
    // our project thinks using IPrefixedInterfaces is a good practice
    "@typescript-eslint/interface-name-prefix": ["error", "always"]
  }
}
```

### Suggesting changes to the recommended set

If you feel _very_, **very**, **_very_** strongly that a specific rule should (or should not) be in the recommended ruleset, please feel free to file an issue along with a **detailed** argument explaining your reasoning. We expect to see you citing concrete evidence supporting why (or why not) a rule is considered best practice. **Please note that if your reasoning is along the lines of "it's what my project/company does", or "I don't like the rule", then we will likely close the request without discussion.**
