import 'vitest';

import type {
  ParserServices,
  ParserServicesWithTypeInformation,
} from '@typescript-eslint/typescript-estree';

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

interface CustomMatchers<Actual = unknown> {
  toHaveTypes(additionalOptions: {
    senderStr: string;
    receiverStr: string;
    declarationIndex?: number;
    passSenderNode?: boolean;
  }): Actual;

  toBeSafeAssignment(additionalOptions?: {
    declarationIndex?: number;
    passSenderNode?: boolean;
  }): Actual;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
