import { resolve } from 'path';

import * as parser from '../../src';
import type { TSESTreeOptions } from '../../src/parser-options';
import { createAndPrepareParseConfig } from '../../tools/test-utils';

console.log(
  'Start of file: parse.moduleResolver.default-program-success.test.ts',
);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('parseAndGenerateServices', () => {
  console.log(
    'Start of describe: parse.moduleResolver.default-program-success.test.ts',
  );

  describe('moduleResolver', () => {
    const { code, config, projectDirectory } = createAndPrepareParseConfig();

    const withDefaultProgramConfig: TSESTreeOptions = {
      ...config,
      project: './tsconfig.defaultProgram.json',
      createDefaultProgram: true,
    };

    describe('when file is not in the project and createDefaultProgram=true', () => {
      // https://github.com/typescript-eslint/typescript-eslint/pull/7088
      // eslint-disable-next-line jest/no-disabled-tests
      it.skip('resolves __PLACEHOLDER__ correctly', () => {
        expect(
          parser
            .parseAndGenerateServices(code, {
              ...withDefaultProgramConfig,
              moduleResolver: resolve(projectDirectory, './moduleResolver.js'),
            })
            .services.program.getSemanticDiagnostics(),
        ).toHaveLength(0);
      });
    });
  });
});
