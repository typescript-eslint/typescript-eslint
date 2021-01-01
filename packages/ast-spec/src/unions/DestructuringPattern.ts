import type { Identifier } from '../expression/Identifier/spec';
import type { MemberExpression } from '../expression/MemberExpression/spec';
import type { ArrayPattern } from '../parameter/ArrayPattern/spec';
import type { AssignmentPattern } from '../parameter/AssignmentPattern/spec';
import type { ObjectPattern } from '../parameter/ObjectPattern/spec';
import type { RestElement } from '../parameter/RestElement/spec';

export type DestructuringPattern =
  | ArrayPattern
  | AssignmentPattern
  | Identifier
  | MemberExpression
  | ObjectPattern
  | RestElement;
