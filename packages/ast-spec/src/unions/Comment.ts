import type { BlockComment } from '../token/BlockComment/spec';
import type { HashbangComment } from '../token/HashbangComment/spec';
import type { LineComment } from '../token/LineComment/spec';

export type Comment = BlockComment | HashbangComment | LineComment;
