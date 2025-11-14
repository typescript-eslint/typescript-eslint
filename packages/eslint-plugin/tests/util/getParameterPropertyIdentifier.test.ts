import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { getParameterPropertyIdentifier } from '../../src/util/getParameterPropertyIdentifier';

describe(getParameterPropertyIdentifier, () => {
  it('returns identifier directly', () => {
    const identifier: TSESTree.Identifier = {
      name: 'foo',
      type: AST_NODE_TYPES.Identifier,
    } as TSESTree.Identifier;

    expect(getParameterPropertyIdentifier(identifier)).toBe(identifier);
  });

  it('extracts identifier from assignment pattern', () => {
    const leftIdentifier: TSESTree.Identifier = {
      name: 'foo',
      type: AST_NODE_TYPES.Identifier,
    } as TSESTree.Identifier;

    const assignmentPattern: TSESTree.AssignmentPattern = {
      left: leftIdentifier,
      right: {} as TSESTree.Expression,
      type: AST_NODE_TYPES.AssignmentPattern,
    } as TSESTree.AssignmentPattern;

    expect(getParameterPropertyIdentifier(assignmentPattern)).toBe(
      leftIdentifier,
    );
  });

  it('throws on invalid parameter type', () => {
    const restElement = {
      type: AST_NODE_TYPES.RestElement,
    } as unknown as TSESTree.TSParameterProperty['parameter'];

    expect(() => getParameterPropertyIdentifier(restElement)).toThrow(
      'Invalid parameter property pattern',
    );
  });

  it('throws on binding pattern in assignment', () => {
    const arrayPattern: TSESTree.ArrayPattern = {
      elements: [],
      type: AST_NODE_TYPES.ArrayPattern,
    } as unknown as TSESTree.ArrayPattern;

    const assignmentPattern = {
      left: arrayPattern,
      right: {} as TSESTree.Expression,
      type: AST_NODE_TYPES.AssignmentPattern,
    } as unknown as TSESTree.AssignmentPattern;

    expect(() => getParameterPropertyIdentifier(assignmentPattern)).toThrow(
      'Parameter property binding pattern should have been rejected by parser',
    );
  });
});
