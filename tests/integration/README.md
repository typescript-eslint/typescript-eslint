# Integration Tests

We have a set of integration tests defined in this project to help ensure we don't inadvertently break downstream packages that depend on us.

These tests are setup to run within docker containers to ensure that each test is completely isolated; we don't want them to affect our local environment, and similarly we don't want them to be effected by our local environment.

## Adding a new integration test

1. [Install docker for your platform](https://docs.docker.com/v17.09/engine/installation/#supported-platforms).
1. Add a new folder in `/tests/integration/fixtures`
1. Add a `.eslintrc.yml`, and a `tsconfig.json` to your folder, with the config required.
1. Create the necessary files to test the integration.
1. Copy+paste the `Dockerfile` from an existing fixture (they are all the same).
1. Copy+paste the `test.sh` from an existing fixture, and adjust the `eslint` command as required.
1. Add a new entry to `docker-compose.yml` by copy+pasting an existing section, and changing the name to match your new folder.
1. Add a new entry to `run-all-tests.sh` by copy+pasting an existing command, and changing the name to match your new folder.
1. Run your integration test by running the single command you copied in the previous step.
   - If your test finishes successfully, a `test.js.snap` will be created.

If you run your test and see the test fail with `Cannot find module './lint-output.json' from 'test.js'`, this means that ESLint errored whilst attempting to run the lint command.
