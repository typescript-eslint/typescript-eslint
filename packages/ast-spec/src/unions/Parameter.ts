import type { Identifier } from '../expression/Identifier/spec';
import type { ArrayPattern } from '../parameter/ArrayPattern/spec';
import type { AssignmentPattern } from '../parameter/AssignmentPattern/spec';
import type { ObjectPattern } from '../parameter/ObjectPattern/spec';
import type { RestElement } from '../parameter/RestElement/spec';
import type { TSParameterProperty } from '../parameter/TSParameterProperty/spec';
import type { BindingName } from './BindingName';

export type Parameter =
  | ArrayPattern
  | (AssignmentPattern & { left: BindingName })
  | Identifier
  | ObjectPattern
  | RestElement
  | TSParameterProperty;
