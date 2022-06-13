import type { AssignmentOperator } from 'typescript';

import { AssignmentOperatorToText } from '../src';

type _Test = {
  readonly [T in AssignmentOperator]: AssignmentOperatorToText[T];
  // If there are any AssignmentOperator members that don't have a corresponding
  // AssignmentOperatorToText, then this line will error with "Type 'T' cannot
  // be used to index type 'AssignmentOperatorToText'."
};
