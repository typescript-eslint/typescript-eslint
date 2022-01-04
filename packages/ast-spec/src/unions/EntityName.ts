import type { Identifier } from '../expression/Identifier/spec';
import type { ThisExpression } from '../expression/ThisExpression/spec';
import type { TSQualifiedName } from '../type/TSQualifiedName/spec';

export type EntityName = Identifier | ThisExpression | TSQualifiedName;
