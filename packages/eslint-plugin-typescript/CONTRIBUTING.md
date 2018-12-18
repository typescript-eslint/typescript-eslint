# Contributing

## Commenting and Discussing

**_Don't be a douche._**
Consider the following when commenting:

-   Everyone is a human (except for the bots).
-   Everyone is freely providing their time for this project.
-   Everyone wants to build the best tool.

## PR Requirements

For a PR to be merged, you must pass the following checks:

-   there must be no lint errors - `yarn lint`
-   the code must be formatted - `yarn format`
-   your documentation must be up to date - `yarn docs-check`
-   all tests must pass - `yarn test`

There is a commit hook which will help you follow this.
Travis will also automatically run these checks when you submit your PR (and will block us merging until you fix it).

## Adding/Changing a rule

When adding or changing a rule, you must:

-   Ensure your feature / bug has an issue behind it.
    -   This just makes it easier for people to find information in future, because PRs aren't included in the default issue search.
-   Ensure your changes are covered by tests.
    -   There's no hard and fast rule for how much testing is required, but try to cover as many bases as you can.
-   Ensure your changes are documented in the `docs` folder. We're working to standardise how we document rules, but your docs should:
    -   describe what the rule does, and why you might enable it.
    -   (if any) outline the settings; how to configure them and what each one does
    -   have clear examples of valid and invalid code when using the rule. Bonus points for extra cases showing what each setting does.

When adding a rule, you must also add a link to the rule in the README.md.

## Submitting Issues

-   If your issue relates to a rule, start your title with the rule name:
    -   `[no-unused-vars] False positive when fooing the bar`
-   Search for the issue before you ask; we try hard to ensure it's easy to find existing issues.
-   Follow the template.
    -   We've built it to reduce the chance of us going back to ask you for things.
    -   Don't be lazy and skip parts of it; we'll just ask you for that information anyway, so it'll only delay the process.
