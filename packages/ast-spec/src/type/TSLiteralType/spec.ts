import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { NullLiteral } from '../../expression/literal/NullLiteral/spec';
import type { RegExpLiteral } from '../../expression/literal/RegExpLiteral/spec';
import type { UnaryExpression } from '../../expression/UnaryExpression/spec';
import type { LiteralExpression } from '../../unions/LiteralExpression';

export interface TSLiteralType extends BaseNode {
  type: AST_NODE_TYPES.TSLiteralType;
  literal:
    | Exclude<LiteralExpression, NullLiteral | RegExpLiteral>
    | (UnaryExpression & { operator: '+' | '-' });
}
