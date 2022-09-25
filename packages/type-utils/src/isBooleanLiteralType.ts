import type { Type } from 'typescript';
import { TypeFlags } from 'typescript';

import { isTypeFlagSet } from './isTypeFlagSet';

export function isBooleanLiteralType(type: Type, literal: boolean): boolean {
  return (
    isTypeFlagSet(type, TypeFlags.BooleanLiteral) &&
    (<{ intrinsicName: string }>(<Record<string, unknown>>(<unknown>type)))
      .intrinsicName === (literal ? 'true' : 'false')
  );
}
