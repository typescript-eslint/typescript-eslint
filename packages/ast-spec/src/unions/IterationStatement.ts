import type { DoWhileStatement } from '../statement/DoWhileStatement/spec';
import type { ForInStatement } from '../statement/ForInStatement/spec';
import type { ForOfStatement } from '../statement/ForOfStatement/spec';
import type { ForStatement } from '../statement/ForStatement/spec';
import type { WhileStatement } from '../statement/WhileStatement/spec';

export type IterationStatement =
  | DoWhileStatement
  | ForInStatement
  | ForOfStatement
  | ForStatement
  | WhileStatement;
