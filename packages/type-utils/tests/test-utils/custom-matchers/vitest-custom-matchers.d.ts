import type {
  ParserServices,
  ParserServicesWithTypeInformation,
} from '@typescript-eslint/typescript-estree';

import 'vitest';

declare global {
  namespace Chai {
    interface Assert {
      toHaveParserServices(
        services: ParserServices | null | undefined,
        errorMessage?: string,
      ): asserts services is ParserServicesWithTypeInformation;
    }
  }
}
