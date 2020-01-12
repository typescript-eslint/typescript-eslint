# Integration Tests

We have a set of integration tests defined in this project to help ensure we don't inadvertently break downstream packages that depend on us.

## Adding a new integration test

1. Add a new folder in `/packages/integration-tests/fixtures`
1. Add a `.eslintrc.yml`, and a `tsconfig.json` to your folder, with the config required.
1. Create the necessary files to test the integration.
1. Add test scenario to the `tests` folder.
