import type { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/types';

import type { DefinitionBase } from '../../../src/definition/DefinitionBase.js';
import type {
  Definition,
  DefinitionType,
  Scope,
  ScopeType,
} from '../../../src/index.js';
import type { ScopeBase } from '../../../src/scope/ScopeBase.js';

chai.use((chai, utils) => {
  //////////////////
  // EXPECT SCOPE //
  //////////////////

  utils.addMethod(chai.assert, 'isScopeOfType', function isScopeOfType<
    Type extends ScopeType,
  >(this: Chai.AssertStatic, scope: Scope, expectedScopeType: Type): asserts scope is Type extends ScopeBase<
    Type,
    infer Block,
    infer Upper
  >['type']
    ? Scope & ScopeBase<Type, Block, Upper>
    : never {
    this.nestedPropertyVal(scope, 'type', expectedScopeType);
  });

  ///////////////////////
  // EXPECT DEFINITION //
  ///////////////////////

  utils.addMethod(
    chai.assert,
    'isDefinitionOfType',
    function isDefinitionOfType<Type extends DefinitionType>(
      this: Chai.AssertStatic,
      definition: Definition,
      expectedDefinitionType: Type,
    ): asserts definition is Type extends DefinitionBase<
      Type,
      infer Node,
      infer Parent,
      infer Name
    >['type']
      ? Definition & DefinitionBase<Type, Node, Parent, Name>
      : never {
      this.nestedPropertyVal(definition, 'type', expectedDefinitionType);
    },
  );

  /////////////////
  // EXPECT MISC //
  /////////////////

  utils.addMethod(chai.assert, 'isNodeOfType', function isNodeOfType<
    Type extends AST_NODE_TYPES,
  >(this: Chai.AssertStatic, node: TSESTree.Node | null | undefined, expectedNodeType: Type): asserts node is TSESTree.Node & {
    type: Type;
  } {
    this.nestedPropertyVal(node, 'type', expectedNodeType);
  });
});
