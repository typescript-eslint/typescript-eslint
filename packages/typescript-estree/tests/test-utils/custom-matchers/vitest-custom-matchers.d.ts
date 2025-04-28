import 'vitest';

import type * as ts from 'typescript';

import type {
  ParseAndGenerateServicesResult,
  ParserServices,
  ParserServicesWithTypeInformation,
  TSESTreeOptions,
} from '../../../src/index.js';

declare global {
  namespace Chai {
    interface Assert {
      toHaveParserServices(
        services: ParserServices | null | undefined,
        errorMessage?: string,
      ): asserts services is ParserServicesWithTypeInformation;

      /**
       * Verifies that the type of a TS node is `number[]` as expected
       */
      isTSNodeOfNumberArrayType(
        checker: ts.TypeChecker,
        tsNode: ts.Node,
        errorMessage?: string,
      ): void;

      testIsolatedFile(
        parseResult: ParseAndGenerateServicesResult<TSESTreeOptions>,
        errorMessage?: string,
      ): void;
    }
  }
}
