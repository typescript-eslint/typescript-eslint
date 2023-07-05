import { resolve } from 'path';

import * as parser from '../../src';
import { createAndPrepareParseConfig } from '../../tools/test-utils';

console.log('Start of file: parse.moduleResolver.placeholder-success.test.ts');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('parseAndGenerateServices', () => {
  console.log(
    'Start of describe: parse.moduleResolver.placeholder-success.test.ts',
  );

  describe('moduleResolver', () => {
    const { code, config, projectDirectory } = createAndPrepareParseConfig();

    describe('when file is in the project', () => {
      it('resolves __PLACEHOLDER__ correctly', () => {
        expect(
          parser
            .parseAndGenerateServices(code, {
              ...config,
              moduleResolver: resolve(projectDirectory, './moduleResolver.js'),
            })
            .services.program.getSemanticDiagnostics(),
        ).toHaveLength(0);
      });
    });
  });
});
