# Integration Tests

We have a set of integration tests defined in this project to help ensure we don't inadvertently break downstream packages that depend on us.

These tests are setup to run within temporary folders to ensure that each test is isolated from the project.

## Adding a new integration test

1. Add a new folder in `/fixtures/`
1. Add a `package.json` to your folder.
1. List the required dependencies under `devDependencies`.
   - Use `latest` for the dependency to ensure we are testing against the newest versions of the package.
   - If you have no dependencies, just add `"devDependencies": {}`.
1. Add a `.eslintrc.js`, and a `tsconfig.json` to your folder, with all of the config required.
1. Create the necessary files to test the integration.
   - Your test should have a lint error in it in an appropriate location.
     This is so that we can be certain the setup actually works correctly.
1. Add a test to `/tests/` named the same as your folder.
1. Paste the following content into your test:

   ```ts
   import { integrationTest } from '../tools/integration-test-base';

   integrationTest(
     __filename,
     '*.ts' /* UPDATE THIS TO THE EXTENSION(s) TO LINT */,
   );
   ```

1. Run your integration test with `yarn test-integration ./tests/integration/tests/your-file.test.ts`
   - This will generate your snapshot output for the lint run which is a JSON representation of your ESLint run.
