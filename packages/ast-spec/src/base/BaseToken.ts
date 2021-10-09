import type { AST_TOKEN_TYPES } from '../ast-token-types';
import type { NodeOrTokenData } from './NodeOrTokenData';

/*
 * Token and Comment are pseudo-nodes to represent pieces of source code
 */
export interface BaseToken extends NodeOrTokenData {
  type: AST_TOKEN_TYPES;
  value: string;
}
