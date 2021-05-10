import type { ArrayExpression } from '../expression/ArrayExpression/spec';
import type { ArrowFunctionExpression } from '../expression/ArrowFunctionExpression/spec';
import type { CallExpression } from '../expression/CallExpression/spec';
import type { ClassExpression } from '../expression/ClassExpression/spec';
import type { FunctionExpression } from '../expression/FunctionExpression/spec';
import type { Identifier } from '../expression/Identifier/spec';
import type { JSXElement } from '../expression/JSXElement/spec';
import type { JSXFragment } from '../expression/JSXFragment/spec';
import type { MemberExpression } from '../expression/MemberExpression/spec';
import type { MetaProperty } from '../expression/MetaProperty/spec';
import type { ObjectExpression } from '../expression/ObjectExpression/spec';
import type { Super } from '../expression/Super/spec';
import type { TaggedTemplateExpression } from '../expression/TaggedTemplateExpression/spec';
import type { TemplateLiteral } from '../expression/TemplateLiteral/spec';
import type { ThisExpression } from '../expression/ThisExpression/spec';
import type { TSAsExpression } from '../expression/TSAsExpression/spec';
import type { TSNonNullExpression } from '../expression/TSNonNullExpression/spec';
import type { TSTypeAssertion } from '../expression/TSTypeAssertion/spec';
import type { ArrayPattern } from '../parameter/ArrayPattern/spec';
import type { ObjectPattern } from '../parameter/ObjectPattern/spec';
import type { LiteralExpression } from './LiteralExpression';

export type LeftHandSideExpression =
  | ArrayExpression
  | ArrayPattern
  | ArrowFunctionExpression
  | CallExpression
  | ClassExpression
  | FunctionExpression
  | Identifier
  | JSXElement
  | JSXFragment
  | LiteralExpression
  | MemberExpression
  | MetaProperty
  | ObjectExpression
  | ObjectPattern
  | Super
  | TaggedTemplateExpression
  | TemplateLiteral
  | ThisExpression
  | TSAsExpression
  | TSNonNullExpression
  | TSTypeAssertion;
