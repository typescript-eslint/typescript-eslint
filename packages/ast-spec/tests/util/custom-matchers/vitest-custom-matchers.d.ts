import 'vitest';

import type {
  ParserResponse,
  ParserResponseType,
} from '../parsers/parser-types.js';

declare global {
  namespace Chai {
    interface Assertion {
      successResponse(errorMessage?: string): void;
      errorResponse(errorMessage?: string): void;
    }

    interface Assert {
      isSuccessResponse<ActualType extends ParserResponse>(
        thing: ActualType,
        errorMessage?: string,
      ): asserts thing is Extract<
        ActualType,
        { type: ParserResponseType.NoError }
      >;

      isNotSuccessResponse<ActualType>(
        thing: ActualType,
        errorMessage?: string,
      ): asserts thing is Exclude<
        ActualType,
        { type: ParserResponseType.NoError }
      >;

      isErrorResponse<ActualType extends ParserResponse>(
        thing: ActualType,
        errorMessage?: string,
      ): asserts thing is Extract<
        ActualType,
        { type: ParserResponseType.Error }
      >;

      isNotErrorResponse<ActualType>(
        thing: ActualType,
        errorMessage?: string,
      ): asserts thing is Exclude<
        ActualType,
        { type: ParserResponseType.Error }
      >;
    }
  }
}
