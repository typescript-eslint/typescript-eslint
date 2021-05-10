// import type { Node } from '../unions/Node';
import type { Range } from './Range';
import type { SourceLocation } from './SourceLocation';

export interface BaseNode {
  /**
   * The source location information of the node.
   * @see {SourceLocation}
   */
  loc: SourceLocation;
  /**
   * @see {Range}
   */
  range: Range;
  /**
   * The parent node of the current node
   */
  // parent?: Node;

  // every node *will* have a type, but let the nodes define their own exact string
  // type: string;
}
