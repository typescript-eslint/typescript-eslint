import { resolve } from 'path';

import * as parser from '../../src';
import { createAndPrepareParseConfig } from '../../tools/test-utils';

console.log(
  'Start of file: parse.moduleResolver.placeholder-error-not-found.test.ts',
);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('parseAndGenerateServices', () => {
  console.log(
    'Start of describe: parse.moduleResolver.placeholder-error-not-found.test.ts',
  );

  describe('moduleResolver', () => {
    const { code, config, projectDirectory } = createAndPrepareParseConfig();

    describe('when file is in the project', () => {
      it('throws error if moduleResolver can not be found', () => {
        expect(() =>
          parser.parseAndGenerateServices(code, {
            ...config,
            moduleResolver: resolve(
              projectDirectory,
              './this_moduleResolver_does_not_exist.js',
            ),
          }),
        ).toThrowErrorMatchingInlineSnapshot(`
        "Could not find the provided parserOptions.moduleResolver.
        Hint: use an absolute path if you are not in control over where the ESLint instance runs."
      `);
      });
    });
  });
});
