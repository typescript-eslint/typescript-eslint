import type { AwaitExpression } from '../expression/AwaitExpression/spec';
import type { TSTypeAssertion } from '../expression/TSTypeAssertion/spec';
import type { UnaryExpression } from '../expression/UnaryExpression/spec';
import type { UpdateExpression } from '../expression/UpdateExpression/spec';
import type { LeftHandSideExpression } from './LeftHandSideExpression';

// TODO - breaking change remove this
export type TSUnaryExpression =
  | AwaitExpression
  | LeftHandSideExpression
  | TSTypeAssertion
  | UnaryExpression
  | UpdateExpression;
