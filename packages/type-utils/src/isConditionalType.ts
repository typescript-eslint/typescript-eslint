import type { ConditionalType, Type } from 'typescript';
import { TypeFlags } from 'typescript';

export function isConditionalType(type: Type): type is ConditionalType {
  return (type.flags & TypeFlags.Conditional) !== 0;
}
