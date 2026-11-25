import type { ObjectExpressionProperty } from '../element/Property/spec';
import type { SpreadElement } from '../element/SpreadElement/spec';

export type ObjectLiteralElement = ObjectExpressionProperty | SpreadElement;

// TODO - breaking change remove this
export type ObjectLiteralElementLike = ObjectLiteralElement;
