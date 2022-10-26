import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TSTypeParameterInstantiation } from '../../special/TSTypeParameterInstantiation/spec';
import type { JSXTagNameExpression } from '../../unions/JSXTagNameExpression';
import type { JSXAttribute } from '../JSXAttribute/spec';
import type { JSXSpreadAttribute } from '../JSXSpreadAttribute/spec';

export interface JSXOpeningElement extends BaseNode {
  type: AST_NODE_TYPES.JSXOpeningElement;
  typeParameters?: TSTypeParameterInstantiation;
  selfClosing: boolean;
  name: JSXTagNameExpression;
  attributes: (JSXAttribute | JSXSpreadAttribute)[];
}
