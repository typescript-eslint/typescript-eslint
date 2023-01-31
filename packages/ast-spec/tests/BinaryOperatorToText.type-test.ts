import type {
  AssignmentOperator,
  BinaryOperator,
  SyntaxKind,
} from 'typescript';

import type { BinaryOperatorToText } from '../src';

type BinaryOperatorWithoutInvalidTypes = Exclude<
  BinaryOperator,
  | AssignmentOperator // --> AssignmentExpression
  | SyntaxKind.CommaToken // -> SequenceExpression
>;
type _Test = {
  readonly [T in BinaryOperatorWithoutInvalidTypes]: BinaryOperatorToText[T];
  // If there are any BinaryOperator members that don't have a corresponding
  // BinaryOperatorToText, then this line will error with "Type 'T' cannot
  // be used to index type 'BinaryOperatorToText'."
};
