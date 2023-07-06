import * as parser from '../../src';
import { createAndPrepareParseConfig } from '../../tools/test-utils';

console.log(
  'Start of file: parse.moduleResolver.placeholder-error-not-resolved.test.ts',
);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('parseAndGenerateServices', () => {
  console.log(
    'Start of describe: parse.moduleResolver.placeholder-error-not-resolved.test.ts',
  );

  describe('moduleResolver', () => {
    const { code, config } = createAndPrepareParseConfig();

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
    });
  });
});
