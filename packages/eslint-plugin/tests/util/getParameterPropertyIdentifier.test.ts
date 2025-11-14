import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

import { getParameterPropertyIdentifier } from '../../src/util/getParameterPropertyIdentifier';

describe('getParameterPropertyIdentifier', () => {
  it('returns identifier directly', () => {
    const identifier: TSESTree.Identifier = {
      type: AST_NODE_TYPES.Identifier,
      name: 'foo',
    } as TSESTree.Identifier;

    expect(getParameterPropertyIdentifier(identifier)).toBe(identifier);
  });

  it('extracts identifier from assignment pattern', () => {
    const leftIdentifier: TSESTree.Identifier = {
      type: AST_NODE_TYPES.Identifier,
      name: 'foo',
    } as TSESTree.Identifier;

    const assignmentPattern: TSESTree.AssignmentPattern = {
      type: AST_NODE_TYPES.AssignmentPattern,
      left: leftIdentifier,
      right: {} as TSESTree.Expression,
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
      type: AST_NODE_TYPES.ArrayPattern,
      elements: [],
    } as unknown as TSESTree.ArrayPattern;

    const assignmentPattern = {
      type: AST_NODE_TYPES.AssignmentPattern,
      left: arrayPattern,
      right: {} as TSESTree.Expression,
    } as unknown as TSESTree.AssignmentPattern;

    expect(() => getParameterPropertyIdentifier(assignmentPattern)).toThrow(
      'Parameter property binding pattern should have been rejected by parser',
    );
  });
});
