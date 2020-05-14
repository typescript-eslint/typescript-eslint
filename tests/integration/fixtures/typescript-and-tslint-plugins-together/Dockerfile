FROM node:erbium

# Copy the test.sh into the container. Every other file will be linked, rather
# than copied to allow for changes without rebuilds wherever possible
WORKDIR /usr
COPY ./test.sh /usr/

# Create file which will be executed by jest
# to assert that the lint output is what we expect
RUN echo "const actualLintOutput = require('./lint-output.json');\n" \
    "\n" \
    "test('it should produce the expected lint ouput', () => {\n" \
    "  expect(actualLintOutput).toMatchSnapshot();\n" \
    "});\n" > test.js

# Run the integration test
CMD [ "./test.sh" ]
