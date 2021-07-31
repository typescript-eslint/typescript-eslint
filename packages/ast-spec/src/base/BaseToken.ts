import type { BaseNode } from './BaseNode';

/*
 * Token and Comment are pseudo-nodes to represent pieces of source code
 */
export interface BaseToken extends BaseNode {
  value: string;
}
