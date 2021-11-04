import type { CallExpression } from '../expression/CallExpression/spec';
import type { MemberExpression } from '../expression/MemberExpression/spec';
import type { TSNonNullExpression } from '../expression/TSNonNullExpression/spec';

export type ChainElement =
  | CallExpression
  | MemberExpression
  | TSNonNullExpression;
