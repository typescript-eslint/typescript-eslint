import { TSESTree } from '@typescript-eslint/types';
import { getKeys as getKeysOriginal } from 'eslint-visitor-keys';

const getKeys: (node: TSESTree.Node) => ReadonlyArray<string> = getKeysOriginal;

export { getKeys };
