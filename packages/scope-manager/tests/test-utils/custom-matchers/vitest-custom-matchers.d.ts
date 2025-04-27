import 'vitest';

import type { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/types';

import type { DefinitionBase } from '../../../src/definition/DefinitionBase.js';
import type {
  Definition,
  DefinitionType,
  Scope,
  ScopeType,
} from '../../../src/index.js';
import type { ScopeBase } from '../../../src/scope/ScopeBase.js';

declare global {
  namespace Chai {
    interface Assert {
      isScopeOfType<Type extends ScopeType>(
        scope: Scope,
        expectedScopeType: Type,
        errorMessage?: string,
      ): asserts scope is Type extends ScopeBase<
        Type,
        infer Block,
        infer Upper
      >['type']
        ? Scope & ScopeBase<Type, Block, Upper>
        : never;

      isDefinitionOfType<Type extends DefinitionType>(
        definition: Definition,
        expectedDefinitionType: Type,
        errorMessage?: string,
      ): asserts definition is Type extends DefinitionBase<
        Type,
        infer Node,
        infer Parent,
        infer Name
      >['type']
        ? Definition & DefinitionBase<Type, Node, Parent, Name>
        : never;

      isNodeOfType<Type extends AST_NODE_TYPES>(
        node: TSESTree.Node | null | undefined,
        expectedNodeType: Type,
        errorMessage?: string,
      ): asserts node is TSESTree.Node & { type: Type };
    }
  }
}
