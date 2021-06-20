import type { Range } from './Range';
import type { SourceLocation } from './SourceLocation';

export interface NodeOrTokenData {
  /**
   * The source location information of the node.
   * @see {SourceLocation}
   */
  loc: SourceLocation;

  /**
   * @see {Range}
   */
  range: Range;

  type: string;
}
