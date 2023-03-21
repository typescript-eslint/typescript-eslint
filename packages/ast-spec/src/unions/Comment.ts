import type { BlockComment } from '../token/BlockComment/spec';
import type { LineComment } from '../token/LineComment/spec';
import type { ShebangComment } from '../token/ShebangComment/spec';

export type Comment = BlockComment | LineComment | ShebangComment;
