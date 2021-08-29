import type { Identifier } from '../expression/Identifier/spec';
import type { NumberLiteral } from '../expression/literal/NumberLiteral/spec';
import type { StringLiteral } from '../expression/literal/StringLiteral/spec';
import type { PrivateIdentifier } from '../special/PrivateIdentifier/spec';
import type { Expression } from '../unions/Expression';

export type PropertyName =
  | ClassPropertyNameNonComputed
  | PropertyNameComputed
  | PropertyNameNonComputed;
export type PropertyNameComputed = Expression;
export type PropertyNameNonComputed =
  | Identifier
  | NumberLiteral
  | StringLiteral;
export type ClassPropertyNameNonComputed =
  | PrivateIdentifier
  // only class properties can have private identifiers as their names
  | PropertyNameNonComputed;
