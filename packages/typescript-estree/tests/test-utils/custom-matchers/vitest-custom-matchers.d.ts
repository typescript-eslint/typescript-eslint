import 'vitest';

import type * as ts from 'typescript';

import type {
  ParserServices,
  ParserServicesWithTypeInformation,
} from '../../../src/index.js';

declare global {
  namespace Chai {
    interface Assertion {
      parserServices(errorMessage?: string): void;
      TSNodeOfNumberArrayType(errorMessage?: string): void;
    }

    interface Assert {
      isParserServices<ActualType extends ParserServices | null | undefined>(
        services: ActualType,
        errorMessage?: string,
      ): asserts services is Extract<
        ActualType,
        ParserServicesWithTypeInformation
      >;

      isNotParserServices<ActualType>(
        services: ActualType,
        errorMessage?: string,
      ): asserts services is Exclude<
        ActualType,
        ParserServicesWithTypeInformation
      >;

      /**
       * Verifies that the type of a TS node is `number[]` as expected
       */
      isTSNodeOfNumberArrayType(
        expected: { checker: ts.TypeChecker; tsNode: ts.Node },
        errorMessage?: string,
      ): void;

      isNotTSNodeOfNumberArrayType(
        expected: { checker: ts.TypeChecker; tsNode: ts.Node },
        errorMessage?: string,
      ): void;
    }
  }
}
