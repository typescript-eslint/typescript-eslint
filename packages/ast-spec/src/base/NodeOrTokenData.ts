import type { Range } from './Range';
import type { SourceLocation } from './SourceLocation';

export interface NodeOrTokenData {
  type: string;

  /**
   * The source location information of the node.
   *
   * The loc property is defined as nullable by ESTree, but ESLint requires this property.
   */
  loc: SourceLocation;

  range: Range;
}
