import type { VariableDeclaration } from '../declaration/VariableDeclaration/spec';
import type { Expression } from './Expression';

export type ForInitialiser = Expression | VariableDeclaration;
