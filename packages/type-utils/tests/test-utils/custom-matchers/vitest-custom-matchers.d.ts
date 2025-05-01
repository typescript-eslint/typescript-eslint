import 'vitest';

import type {
  ParserServices,
  ParserServicesWithTypeInformation,
} from '@typescript-eslint/typescript-estree';

import type { ReadonlynessOptions } from '../../../src/isTypeReadonly.js';

declare global {
  namespace Chai {
    interface Assertion {
      parserServices(errorMessage?: string): void;
    }

    interface Assert {
      isParserServices(
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

  toBeValidSpecifier(): Actual;

  toMatchSpecifier(expectedTypeOrValueSpecifier: TypeOrValueSpecifier): Actual;

  toBeReadOnly(readOnlyNessOptions: ReadonlynessOptions | undefined): Actual;

  toContainsAllTypesByName(additionalOptions?: {
    allowAny?: boolean;
    allowedNames?: Set<string>;
    matchAnyInstead?: boolean;
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
