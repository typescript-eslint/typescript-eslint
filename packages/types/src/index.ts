// TODO(Brad Zacher) - convert this to export * as TSESTree from './ts-estree'
// https://github.com/sandersn/downlevel-dts/pull/42
import * as TSESTree from './ts-estree';

export { AST_NODE_TYPES } from './ast-node-types';
export { AST_TOKEN_TYPES } from './ast-token-types';
export * from './lib';
export * from './parser-options';
export { TSESTree };
