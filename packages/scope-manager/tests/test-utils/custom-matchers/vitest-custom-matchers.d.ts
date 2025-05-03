import 'vitest';

import type { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/types';
import type { TSESTreeOptions } from '@typescript-eslint/typescript-estree';

import type {
  Definition,
  DefinitionType,
  Scope,
  ScopeType,
} from '../../../src/index.js';

declare global {
  namespace Chai {
    interface Assertion {
      scopeOfType(expectedScopeType: ScopeType, errorMessage?: string): void;

      definitionOfType(
        expectedDefinitionType: DefinitionType,
        errorMessage?: string,
      ): void;

      nodeOfType(expectedNodeType: AST_NODE_TYPES, errorMessage?: string): void;
    }

    interface Assert {
      isScopeOfType<ActualType extends Scope, ExpectedType extends ScopeType>(
        scope: ActualType,
        expectedScopeType: ExpectedType,
        errorMessage?: string,
      ): asserts scope is Extract<ActualType, { type: ExpectedType }>;

      isNotScopeOfType<ActualType, ExpectedType extends ScopeType>(
        scope: ActualType,
        expectedScopeType: ExpectedType,
        errorMessage?: string,
      ): asserts scope is Exclude<ActualType, { type: ExpectedType }>;

      isDefinitionOfType<
        ActualType extends Definition,
        ExpectedType extends DefinitionType,
      >(
        definition: ActualType,
        expectedDefinitionType: ExpectedType,
        errorMessage?: string,
      ): asserts definition is Extract<ActualType, { type: ExpectedType }>;

      isNotDefinitionOfType<ActualType, ExpectedType extends DefinitionType>(
        definition: ActualType,
        expectedDefinitionType: ExpectedType,
        errorMessage?: string,
      ): asserts definition is Exclude<ActualType, { type: ExpectedType }>;

      isNodeOfType<
        ActualType extends TSESTree.Node | null | undefined,
        ExpectedType extends AST_NODE_TYPES,
      >(
        node: ActualType,
        expectedNodeType: ExpectedType,
        errorMessage?: string,
      ): asserts node is Extract<ActualType, { type: ExpectedType }>;

      isNotNodeOfType<ActualType, ExpectedType extends AST_NODE_TYPES>(
        node: ActualType,
        expectedNodeType: ExpectedType,
        errorMessage?: string,
      ): asserts node is Exclude<ActualType, { type: ExpectedType }>;
    }
  }
}

interface CustomMatchers<ActualType = unknown> {
  toHaveDeclaredVariables(additionalOptions: {
    astNodeType: AST_NODE_TYPES;
    expectedNamesList: string[][];
    parserOptions?: TSESTreeOptions;
  }): ActualType;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
