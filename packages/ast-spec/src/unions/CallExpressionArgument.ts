import type { SpreadElement } from '../element/SpreadElement/spec';
import type { Expression } from './Expression';

export type CallExpressionArgument = Expression | SpreadElement;
