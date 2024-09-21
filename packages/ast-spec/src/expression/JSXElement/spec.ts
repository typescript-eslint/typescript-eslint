import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { JSXClosingElement } from '../../jsx/JSXClosingElement/spec';
import type { JSXOpeningElement } from '../../jsx/JSXOpeningElement/spec';
import type { JSXChild } from '../../unions/JSXChild';

export interface JSXElement extends BaseNode {
  children: JSXChild[];
  closingElement: JSXClosingElement | null;
  openingElement: JSXOpeningElement;
  type: AST_NODE_TYPES.JSXElement;
}
