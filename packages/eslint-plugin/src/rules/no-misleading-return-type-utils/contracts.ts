import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import type { AnalysisState } from './analysis-state';
import type { PropertyProjections } from './property-projections';
import type { FunctionNode } from './shared';

import { getBaseTypesOfClassMember } from '../../util';
import { hasAnyDecorators } from './shared';

export interface ContractAnalysis {
  isAffectedByDecorators: (functionNode: ts.FunctionLikeDeclaration) => boolean;
  isOverloadImplementation: (tsFunctionNode: ts.Node) => boolean;
  mirrorsBaseContract: (node: FunctionNode, annotatedType: ts.Type) => boolean;
  mirrorsContextualContract: (
    tsFunctionNode: ts.Node,
    annotatedType: ts.Type,
  ) => boolean;
}

export function createContractAnalysis(
  state: AnalysisState,
  properties: PropertyProjections,
): ContractAnalysis {
  const { checker, isTypeAssignableTo, services } = state;
  const { getPropertyName } = properties;
  const decoratedClasses = new WeakMap<
    ts.ClassDeclaration | ts.ClassExpression,
    boolean
  >();

  /**
   * Implementation signatures must be wide enough for every overload, so
   * they are never treated as misleading.
   */
  function isOverloadImplementation(tsFunctionNode: ts.Node): boolean {
    return (
      tsutils.isSignatureDeclaration(tsFunctionNode) &&
      checker.isImplementationOfOverload(tsFunctionNode) === true
    );
  }

  /**
   * Call signatures across every union constituent: contract properties are
   * often written as `'literal' | ((...) => T)`, where the callable branch
   * still carries the return contract.
   */
  function getCallSignaturesOfConstituents(
    type: ts.Type,
  ): readonly ts.Signature[] {
    return tsutils
      .unionConstituents(type)
      .flatMap(member =>
        checker.getSignaturesOfType(member, ts.SignatureKind.Call),
      );
  }

  function isMutuallyAssignable(a: ts.Type, b: ts.Type): boolean {
    return isTypeAssignableTo(a, b) && isTypeAssignableTo(b, a);
  }

  /**
   * An annotation mutually assignable with an inherited member type
   * documents the base contract, not this implementation.
   */
  function mirrorsBaseContract(
    node: FunctionNode,
    annotatedType: ts.Type,
  ): boolean {
    const member =
      node.parent.type === AST_NODE_TYPES.MethodDefinition ||
      (node.parent.type === AST_NODE_TYPES.PropertyDefinition &&
        node.parent.value === node)
        ? node.parent
        : undefined;
    if (member == null) {
      return false;
    }

    for (const { baseMemberType } of getBaseTypesOfClassMember(
      services,
      member,
    )) {
      const signatures = getCallSignaturesOfConstituents(baseMemberType);
      if (
        signatures.length > 0
          ? signatures.some(signature =>
              isMutuallyAssignable(
                annotatedType,
                checker.getReturnTypeOfSignature(signature),
              ),
            )
          : isMutuallyAssignable(annotatedType, baseMemberType)
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Return types the surrounding context declares for this function
   * (callback parameters, contextually typed object members).
   */
  function getContextualReturnTypes(tsFunctionNode: ts.Node): ts.Type[] {
    if (
      ts.isArrowFunction(tsFunctionNode) ||
      ts.isFunctionExpression(tsFunctionNode)
    ) {
      const contextual = checker.getContextualType(tsFunctionNode);
      return contextual == null
        ? []
        : getCallSignaturesOfConstituents(contextual).map(signature =>
            checker.getReturnTypeOfSignature(signature),
          );
    }

    if (
      (ts.isMethodDeclaration(tsFunctionNode) ||
        ts.isGetAccessorDeclaration(tsFunctionNode)) &&
      ts.isObjectLiteralExpression(tsFunctionNode.parent)
    ) {
      const contextualObject = checker.getContextualType(tsFunctionNode.parent);
      const propertyName = getPropertyName(tsFunctionNode.name);
      if (contextualObject == null || propertyName == null) {
        return [];
      }
      const property = checker.getPropertyOfType(
        contextualObject,
        propertyName,
      );
      if (property == null) {
        return [];
      }
      const propertyType = checker.getTypeOfSymbolAtLocation(
        property,
        tsFunctionNode,
      );
      if (ts.isGetAccessorDeclaration(tsFunctionNode)) {
        return [propertyType];
      }
      return getCallSignaturesOfConstituents(propertyType).map(signature =>
        checker.getReturnTypeOfSignature(signature),
      );
    }

    return [];
  }

  /**
   * An annotation matching a contextual return contract restates what the
   * receiving API requires.
   */
  function mirrorsContextualContract(
    tsFunctionNode: ts.Node,
    annotatedType: ts.Type,
  ): boolean {
    return getContextualReturnTypes(tsFunctionNode).some(contextualType =>
      isMutuallyAssignable(annotatedType, contextualType),
    );
  }

  /**
   * Any legacy decorator receives the prototype and may patch sibling
   * members imperatively, so one decorated member taints the class.
   */
  function classHasDecorators(
    classNode: ts.ClassDeclaration | ts.ClassExpression,
  ): boolean {
    const cached = decoratedClasses.get(classNode);
    if (cached != null) {
      return cached;
    }
    const result =
      hasAnyDecorators(classNode) ||
      classNode.members.some(member => {
        if (hasAnyDecorators(member)) {
          return true;
        }
        return (
          (ts.isConstructorDeclaration(member) ||
            ts.isMethodDeclaration(member) ||
            ts.isGetAccessorDeclaration(member) ||
            ts.isSetAccessorDeclaration(member)) &&
          member.parameters.some(hasAnyDecorators)
        );
      });
    decoratedClasses.set(classNode, result);
    return result;
  }

  /**
   * The property declaration a function initializes, if it directly
   * initializes one.
   */
  function getPropertyFunctionInitializer(
    functionNode: ts.ArrowFunction | ts.FunctionExpression,
  ): ts.PropertyDeclaration | undefined {
    let child: ts.Node = functionNode;
    const property = ts.findAncestor(functionNode, ancestor => {
      if (
        ts.isSourceFile(ancestor) ||
        ts.isClassDeclaration(ancestor) ||
        ts.isClassExpression(ancestor) ||
        ts.isMethodDeclaration(ancestor) ||
        ts.isGetAccessorDeclaration(ancestor) ||
        ts.isSetAccessorDeclaration(ancestor)
      ) {
        return 'quit';
      }
      const isInitializer =
        ts.isPropertyDeclaration(ancestor) && ancestor.initializer === child;
      child = ancestor;
      return isInitializer;
    });
    return property != null && ts.isPropertyDeclaration(property)
      ? property
      : undefined;
  }

  /**
   * Decorators can replace runtime implementations, making body analysis
   * unsound for the affected members.
   */
  function isAffectedByDecorators(
    functionNode: ts.FunctionLikeDeclaration,
  ): boolean {
    if (hasAnyDecorators(functionNode)) {
      return true;
    }

    const member =
      ts.isArrowFunction(functionNode) || ts.isFunctionExpression(functionNode)
        ? getPropertyFunctionInitializer(functionNode)
        : ts.isMethodDeclaration(functionNode) ||
            ts.isGetAccessorDeclaration(functionNode) ||
            ts.isSetAccessorDeclaration(functionNode)
          ? functionNode
          : undefined;
    if (member == null) {
      return false;
    }
    if (member !== functionNode && hasAnyDecorators(member)) {
      return true;
    }
    return (
      (ts.isClassDeclaration(member.parent) ||
        ts.isClassExpression(member.parent)) &&
      classHasDecorators(member.parent)
    );
  }

  return {
    isAffectedByDecorators,
    isOverloadImplementation,
    mirrorsBaseContract,
    mirrorsContextualContract,
  };
}
