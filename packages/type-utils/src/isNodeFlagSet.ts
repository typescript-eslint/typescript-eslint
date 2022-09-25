import type { Node, NodeFlags } from 'typescript';

import { isFlagSet } from './isFlagSet';

export const isNodeFlagSet: (node: Node, flag: NodeFlags) => boolean =
  isFlagSet;
