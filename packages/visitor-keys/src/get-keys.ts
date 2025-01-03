import type { TSESTree } from '@typescript-eslint/types';

import { getKeys as getKeysOriginal } from 'eslint-visitor-keys';

export const getKeys: (node: TSESTree.Node) => readonly string[] =
  getKeysOriginal;
