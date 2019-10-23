#!/bin/bash

# Generate the package.json to use
node /usr/utils/generate-package-json.js

# Install dependencies
npm install

# Use the local volumes for our own packages
npm install $(npm pack /usr/typescript-estree | tail -1)
npm install $(npm pack /usr/parser | tail -1)
npm install $(npm pack /usr/eslint-plugin | tail -1)

# Install the latest vue-eslint-parser (this may break us occassionally, but it's probably good to get that feedback early)
npm install vue-eslint-parser@latest

# Install the latest eslint-plugin-vue (this may break us occassionally, but it's probably good to get that feedback early)
npm install eslint-plugin-vue@latest

# Install the latest some other vue utilities
npm install vuex@latest
npm install vue-property-decorator@latest

# Run the linting
# (the "|| true" helps make sure that we run our tests on failed linting runs as well)
npx eslint --format json --output-file /usr/lint-output.json --config /usr/linked/.eslintrc.yml /usr/linked/**/*.vue || true

# Run our assertions against the linting output
npx jest /usr/test.js --snapshotResolver=/usr/utils/jest-snapshot-resolver.js
