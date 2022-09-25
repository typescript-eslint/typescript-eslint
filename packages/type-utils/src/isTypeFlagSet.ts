import type { Type, TypeFlags } from 'typescript';

import { isFlagSet } from './isFlagSet';

export const isTypeFlagSet: (type: Type, flag: TypeFlags) => boolean =
  isFlagSet;
