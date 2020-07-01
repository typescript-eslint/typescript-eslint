#!/bin/bash
set -exuo pipefail

# Generate the package.json to use
node /usr/utils/generate-package-json.js

# Install dependencies
npm install

# Use the local volumes for our own packages
npm install $(npm pack /usr/types | tail -1)
npm install $(npm pack /usr/visitor-keys | tail -1)
npm install $(npm pack /usr/scope-manager | tail -1)
npm install $(npm pack /usr/typescript-estree | tail -1)
npm install $(npm pack /usr/parser | tail -1)
npm install $(npm pack /usr/experimental-utils | tail -1)
npm install $(npm pack /usr/eslint-plugin | tail -1)

# Run the linting
# (the "|| true" helps make sure that we run our tests on failed linting runs as well)
npx eslint --format json --output-file /usr/lint-output.json --config /usr/linked/.eslintrc.js /usr/linked/**/*.ts || true

# Run our assertions against the linting output
npx jest /usr/test.js --snapshotResolver=/usr/utils/jest-snapshot-resolver.js
