import { resolve } from 'path';

import * as parser from '../../src';
import type { TSESTreeOptions } from '../../src/parser-options';
import { createAndPrepareParseConfig } from '../../tools/test-utils';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('parseAndGenerateServices', () => {
  describe('moduleResolver', () => {
    const { code, config, projectDirectory } = createAndPrepareParseConfig();

    const withDefaultProgramConfig: TSESTreeOptions = {
      ...config,
      project: './tsconfig.defaultProgram.json',
      createDefaultProgram: true,
    };

    describe('when file is not in the project and createDefaultProgram=true', () => {
      it('resolves __PLACEHOLDER__ correctly', () => {
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
