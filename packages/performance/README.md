# Performance Testing

A quick internal utility for testing lint performance.

## Generating a Summary

`test:summary` runs the three performance scenarios under different file counts, then prints a summary table:

```shell
yarn test:summary
```

For each of those file counts, the generated code is 50% `.js` and 50% `.ts`.

## Running Tests Manually

First generate the number of files you'd like to test:

```shell
PERFORMANCE_FILE_COUNT=123 yarn generate
```

Then run one or more of the test types:

- `yarn test:project`: Traditional `project: true`
- `yarn test:service` `EXPERIMENTAL_useProjectService`
- `yarn test:service:seeded`: `EXPERIMENTAL_useProjectService`, with `allowDefaultProjectFallbackFilesGlobs`
