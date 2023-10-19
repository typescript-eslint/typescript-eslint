import type { OperatorPrecedence } from './getOperatorPrecedence';

export function getWrappedCode(
  text: string,
  nodePrecedence: OperatorPrecedence,
  parentPrecedence: OperatorPrecedence,
): string {
  return nodePrecedence > parentPrecedence ? text : `(${text})`;
}
