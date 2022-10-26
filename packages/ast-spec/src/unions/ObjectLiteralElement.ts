import type { MethodDefinition } from '../element/MethodDefinition/spec';
import type { Property } from '../element/Property/spec';
import type { SpreadElement } from '../element/SpreadElement/spec';

export type ObjectLiteralElement = MethodDefinition | Property | SpreadElement;

// TODO - breaking change remove this
export type ObjectLiteralElementLike = ObjectLiteralElement;
