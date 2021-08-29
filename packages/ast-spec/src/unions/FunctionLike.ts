import type { FunctionDeclaration } from '../declaration/FunctionDeclaration/spec';
import type { TSDeclareFunction } from '../declaration/TSDeclareFunction/spec';
import type { ArrowFunctionExpression } from '../expression/ArrowFunctionExpression/spec';
import type { FunctionExpression } from '../expression/FunctionExpression/spec';
import type { TSEmptyBodyFunctionExpression } from '../expression/TSEmptyBodyFunctionExpression/spec';

export type FunctionLike =
  | ArrowFunctionExpression
  | FunctionDeclaration
  | FunctionExpression
  | TSDeclareFunction
  | TSEmptyBodyFunctionExpression;
