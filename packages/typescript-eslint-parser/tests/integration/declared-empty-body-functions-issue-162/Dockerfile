FROM node:carbon

# Copy the package.json into the container so that we can
# run the install. Every other file will be linked, rather
# than copied to allow for changes without rebuilds
WORKDIR /usr
COPY ./package.json /usr/

# Create file which will be executed by jest
# to assert that the lint output is what we expect
RUN echo "const expectedLintOutput = require('./linked/expected-lint-output.json');\n" \
         "const actualLintOutput = require('./lint-output.json');\n" \
         "\n" \
         "test('it should produce the expected lint ouput', () => {\n" \
         "  expect(actualLintOutput).toEqual(expectedLintOutput);\n" \
         "});\n" > test.js

# Install dependencies
RUN npm install

# Run ESLint and assert that the output matches our expectations
CMD [ "npm", "start" ]
