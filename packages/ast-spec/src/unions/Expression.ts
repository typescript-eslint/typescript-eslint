import type { ArrayExpression } from '../expression/ArrayExpression/spec';
import type { ArrowFunctionExpression } from '../expression/ArrowFunctionExpression/spec';
import type { AssignmentExpression } from '../expression/AssignmentExpression/spec';
import type { AwaitExpression } from '../expression/AwaitExpression/spec';
import type { BinaryExpression } from '../expression/BinaryExpression/spec';
import type { CallExpression } from '../expression/CallExpression/spec';
import type { ChainExpression } from '../expression/ChainExpression/spec';
import type { ClassExpression } from '../expression/ClassExpression/spec';
import type { ConditionalExpression } from '../expression/ConditionalExpression/spec';
import type { FunctionExpression } from '../expression/FunctionExpression/spec';
import type { Identifier } from '../expression/Identifier/spec';
import type { ImportExpression } from '../expression/ImportExpression/spec';
import type { JSXElement } from '../expression/JSXElement/spec';
import type { JSXFragment } from '../expression/JSXFragment/spec';
import type { LogicalExpression } from '../expression/LogicalExpression/spec';
import type { MemberExpression } from '../expression/MemberExpression/spec';
import type { MetaProperty } from '../expression/MetaProperty/spec';
import type { NewExpression } from '../expression/NewExpression/spec';
import type { ObjectExpression } from '../expression/ObjectExpression/spec';
import type { SequenceExpression } from '../expression/SequenceExpression/spec';
import type { Super } from '../expression/Super/spec';
import type { TaggedTemplateExpression } from '../expression/TaggedTemplateExpression/spec';
import type { TemplateLiteral } from '../expression/TemplateLiteral/spec';
import type { ThisExpression } from '../expression/ThisExpression/spec';
import type { TSAsExpression } from '../expression/TSAsExpression/spec';
import type { TSNonNullExpression } from '../expression/TSNonNullExpression/spec';
import type { TSTypeAssertion } from '../expression/TSTypeAssertion/spec';
import type { UnaryExpression } from '../expression/UnaryExpression/spec';
import type { UpdateExpression } from '../expression/UpdateExpression/spec';
import type { YieldExpression } from '../expression/YieldExpression/spec';
import type { ArrayPattern } from '../parameter/ArrayPattern/spec';
import type { ObjectPattern } from '../parameter/ObjectPattern/spec';
import type { LiteralExpression } from './LiteralExpression';

/*
This isn't technically correct, as it includes ArrayPattern and ObjectPattern - which are only valid
in a LeftHandSideExpression, and not in a general expression location.

However most of the time that this type is used, the intention will be to assign a LeftHandSideExpression to this type.
So excluding the Pattern types just makes it a pain, as people have to write Expression | LeftHandSideExpression everywhere.
*/

export type Expression =
  | ArrayExpression
  | ArrayPattern
  | ArrowFunctionExpression
  | AssignmentExpression
  | AwaitExpression
  | BinaryExpression
  | CallExpression
  | ChainExpression
  | ClassExpression
  | ClassExpression
  | ConditionalExpression
  | FunctionExpression
  | FunctionExpression
  | Identifier
  | ImportExpression
  | JSXElement
  | JSXFragment
  | LiteralExpression
  | LogicalExpression
  | MemberExpression
  | MetaProperty
  | NewExpression
  | ObjectExpression
  | ObjectPattern
  | SequenceExpression
  | Super
  | TaggedTemplateExpression
  | TemplateLiteral
  | ThisExpression
  | TSAsExpression
  | TSNonNullExpression
  | TSTypeAssertion
  | UnaryExpression
  | UpdateExpression
  | YieldExpression;
