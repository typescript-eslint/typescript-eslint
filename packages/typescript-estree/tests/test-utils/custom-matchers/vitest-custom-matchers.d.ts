import type * as ts from 'typescript';

import 'vitest';

import type {
  ParserServices,
  ParserServicesWithTypeInformation,
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
    }
  }
}
