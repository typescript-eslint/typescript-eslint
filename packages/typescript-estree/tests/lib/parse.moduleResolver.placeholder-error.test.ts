import { resolve } from 'path';

import * as parser from '../../src';
import { createAndPrepareParseConfig } from '../../tools/test-utils';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('parseAndGenerateServices', () => {
  describe('moduleResolver', () => {
    const { code, config, projectDirectory } = createAndPrepareParseConfig();

    describe('when file is in the project', () => {
      it('returns error if __PLACEHOLDER__ can not be resolved', () => {
        expect(
          parser
            .parseAndGenerateServices(code, config)
            .services.program.getSemanticDiagnostics(),
        ).toHaveProperty(
          [0, 'messageText'],
          "Cannot find module '__PLACEHOLDER__' or its corresponding type declarations.",
        );
      });

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
