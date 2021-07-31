import type { ArrayExpression } from '../expression/ArrayExpression/spec';
import type { ClassExpression } from '../expression/ClassExpression/spec';
import type { FunctionExpression } from '../expression/FunctionExpression/spec';
import type { Identifier } from '../expression/Identifier/spec';
import type { JSXElement } from '../expression/JSXElement/spec';
import type { JSXFragment } from '../expression/JSXFragment/spec';
import type { MetaProperty } from '../expression/MetaProperty/spec';
import type { ObjectExpression } from '../expression/ObjectExpression/spec';
import type { Super } from '../expression/Super/spec';
import type { TemplateLiteral } from '../expression/TemplateLiteral/spec';
import type { ThisExpression } from '../expression/ThisExpression/spec';
import type { JSXOpeningElement } from '../jsx/JSXOpeningElement/spec';
import type { ArrayPattern } from '../parameter/ArrayPattern/spec';
import type { ObjectPattern } from '../parameter/ObjectPattern/spec';
import type { TSNullKeyword } from '../type/TSNullKeyword/spec';
import type { LiteralExpression } from './LiteralExpression';

// TODO - breaking change remove this
export type PrimaryExpression =
  | ArrayExpression
  | ArrayPattern
  | ClassExpression
  | FunctionExpression
  | Identifier
  | JSXElement
  | JSXFragment
  | JSXOpeningElement
  | LiteralExpression
  | MetaProperty
  | ObjectExpression
  | ObjectPattern
  | Super
  | TemplateLiteral
  | ThisExpression
  | TSNullKeyword;
