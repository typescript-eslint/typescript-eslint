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
    }
  }
}
