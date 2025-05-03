import type { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/types';
import type { TSESTreeOptions } from '@typescript-eslint/typescript-estree';

import { parse, simpleTraverse } from '@typescript-eslint/typescript-estree';

import type {
  Definition,
  DefinitionType,
  Scope,
  ScopeType,
} from '../../../src/index.js';

import { analyze } from '../../../src/index.js';

chai.use((chai, utils) => {
  //////////////////
  // EXPECT SCOPE //
  //////////////////

  function scopeOfType(
    this: Chai.AssertionStatic,
    expectedScopeType: ScopeType,
    errorMessage?: string,
  ) {
    if (errorMessage) {
      utils.flag(this, 'message', errorMessage);
    }

    const scope: Scope | undefined = utils.flag(this, 'object');

    const negate: boolean = utils.flag(this, 'negate') ?? false;

    const ssfi: (...args: unknown[]) => unknown = utils.flag(this, 'ssfi');

    const assertion = new chai.Assertion(scope, errorMessage, ssfi, true);

    (negate ? assertion.not : assertion).to.have
      .property('type')
      .that.equals(expectedScopeType);
  }

  chai.Assertion.addMethod(scopeOfType.name, scopeOfType);

  chai.assert.isScopeOfType = (scope, expectedScopeType, errorMessage) => {
    new chai.Assertion(
      scope,
      errorMessage,
      chai.assert.isScopeOfType,
      true,
    ).to.be.scopeOfType(expectedScopeType);
  };

  chai.assert.isNotScopeOfType = (scope, expectedScopeType, errorMessage) => {
    new chai.Assertion(
      scope,
      errorMessage,
      chai.assert.isNotScopeOfType,
      true,
    ).not.to.be.scopeOfType(expectedScopeType);
  };

  ///////////////////////
  // EXPECT DEFINITION //
  ///////////////////////

  function definitionOfType(
    this: Chai.AssertionStatic,
    expectedDefinitionType: DefinitionType,
    errorMessage?: string,
  ) {
    if (errorMessage) {
      utils.flag(this, 'message', errorMessage);
    }

    const definition: Definition | undefined = utils.flag(this, 'object');

    const negate: boolean = utils.flag(this, 'negate') ?? false;

    const ssfi: (...args: unknown[]) => unknown = utils.flag(this, 'ssfi');

    const assertion = new chai.Assertion(definition, errorMessage, ssfi, true);
    (negate ? assertion.not : assertion).to.have
      .property('type')
      .that.equals(expectedDefinitionType);
  }

  chai.Assertion.addMethod(definitionOfType.name, definitionOfType);

  chai.assert.isDefinitionOfType = (
    definition,
    expectedDefinitionType,
    errorMessage,
  ) => {
    new chai.Assertion(
      definition,
      errorMessage,
      chai.assert.isDefinitionOfType,
      true,
    ).to.be.definitionOfType(expectedDefinitionType);
  };

  chai.assert.isNotDefinitionOfType = (
    definition,
    expectedDefinitionType,
    errorMessage,
  ) => {
    new chai.Assertion(
      definition,
      errorMessage,
      chai.assert.isNotDefinitionOfType,
      true,
    ).not.to.be.definitionOfType(expectedDefinitionType);
  };

  /////////////////
  // EXPECT MISC //
  /////////////////

  function nodeOfType(
    this: Chai.AssertionStatic,
    expectedNodeType: AST_NODE_TYPES,
    errorMessage?: string,
  ) {
    if (errorMessage) {
      utils.flag(this, 'message', errorMessage);
    }

    const node: TSESTree.Node | null | undefined = utils.flag(this, 'object');

    const negate: boolean = utils.flag(this, 'negate') ?? false;

    const ssfi: (...args: unknown[]) => unknown = utils.flag(this, 'ssfi');

    const assertion = new chai.Assertion(node, errorMessage, ssfi, true);

    (negate ? assertion.not : assertion).to.have
      .property('type')
      .that.equals(expectedNodeType);
  }

  chai.Assertion.addMethod(nodeOfType.name, nodeOfType);

  chai.assert.isNodeOfType = (node, expectedNodeType, errorMessage) => {
    new chai.Assertion(
      node,
      errorMessage,
      chai.assert.isNodeOfType,
      true,
    ).to.be.nodeOfType(expectedNodeType);
  };

  chai.assert.isNotNodeOfType = (node, expectedNodeType, errorMessage) => {
    new chai.Assertion(
      node,
      errorMessage,
      chai.assert.isNotNodeOfType,
      true,
    ).not.to.be.nodeOfType(expectedNodeType);
  };
});

const DEFAULT_PARSER_OPTIONS = {
  // the analyser requires ranges to work
  range: true,
} as const satisfies TSESTreeOptions;

expect.extend({
  toHaveDeclaredVariables(
    code: string,
    additionalOptions: {
      astNodeType: AST_NODE_TYPES;
      expectedNamesList: string[][];
      parserOptions?: TSESTreeOptions;
    },
  ) {
    const { customTesters, equals, isNot, utils } = this;

    const {
      astNodeType,
      expectedNamesList,
      parserOptions = {},
    } = additionalOptions;

    const expectationResult = {
      message: () => ``,
      pass: true,
    };

    const ast = parse(code, { ...DEFAULT_PARSER_OPTIONS, ...parserOptions });

    const scopeManager = analyze(ast, {
      sourceType: 'module',
    });

    simpleTraverse(ast, {
      visitors: {
        [astNodeType](node) {
          const expected = expectedNamesList.shift();

          assert.isDefined(expected);

          const actual = scopeManager.getDeclaredVariables(node);

          if (actual.length !== expected.length) {
            Object.assign(expectationResult, {
              actual: actual.length,
              expected: expected.length,
              message: () =>
                `Expected both arrays${isNot ? ' not' : ''} to have the same length.`,
              pass: false,
            });
            return;
          }

          if (actual.length > 0) {
            const actualNames = Object.values(actual).map(({ name }) => name);

            if (
              !equals(
                actualNames,
                expected,
                [
                  ...customTesters,
                  utils.iterableEquality,
                  utils.subsetEquality,
                ],
                true,
              )
            ) {
              Object.assign(expectationResult, {
                actual: actualNames,
                expected,
                message: () =>
                  `Expected both arrays${isNot ? ' not' : ''} to be equal.`,
                pass: false,
              });
              return;
            }
          }
        },
      },
    });

    if (!expectationResult.pass) {
      return expectationResult;
    }

    return {
      actual: expectedNamesList.length,
      expected: 0,
      message: () =>
        `Expected the name list array${isNot ? ' not' : ''} to be empty.`,
      pass: expectedNamesList.length === 0,
    };
  },
});
