# Premade Configs

This page has moved to [docs/linting/PRESETS.md](../../../../docs/linting/PRESETS.md).

### Altering the `recommended` set to suit your project

If you disagree with a rule (or it disagrees with your codebase), consider using your local config to change the rule config so it works for your project.

```jsonc
{
  "extends": ["plugin:@typescript-eslint/recommended"],
  "rules": {
    // our project thinks using IPrefixedInterfaces is a good practice
    "@typescript-eslint/interface-name-prefix": ["error", "always"]
  }
}
```

### Suggesting changes to the `recommended` set
