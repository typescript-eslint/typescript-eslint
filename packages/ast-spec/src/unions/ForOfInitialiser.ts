import type {
  LetOrConstOrVarDeclaration,
  UsingInForOfDeclaration,
} from '../declaration/VariableDeclaration/spec';
import type { Expression } from './Expression';

export type ForOfInitialiser =
  | Expression
  | LetOrConstOrVarDeclaration
  | UsingInForOfDeclaration;
