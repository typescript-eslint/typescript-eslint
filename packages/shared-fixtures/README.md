# Shared Fixtures

Code samples used for testing the parser.

## Adding a Fixture

Add any new fixtures to the appropriate folder within `./fixtures`.
Try to not add too many cases per file, as it makes the snapshot hard to review.

Once you're done, run `yarn generate-tests`.
This will automatically create test files in both the `parser` and `typescript-estree` packages.

Finally, run the tests in both of those packages, either individually by `cd`ing into the respective folders,
Or by running all tests in the workspace by `cd`ing to the root.
You can run tests in the project root or a package root via `yarn test`.
