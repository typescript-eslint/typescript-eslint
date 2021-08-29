import type { Identifier } from '../expression/Identifier/spec';
import type { NumberLiteral } from '../expression/literal/NumberLiteral/spec';
import type { StringLiteral } from '../expression/literal/StringLiteral/spec';
import type { Expression } from '../unions/Expression';

export type PropertyName = PropertyNameComputed | PropertyNameNonComputed;
export type PropertyNameComputed = Expression;
export type PropertyNameNonComputed =
  | Identifier
  | NumberLiteral
  | StringLiteral;
