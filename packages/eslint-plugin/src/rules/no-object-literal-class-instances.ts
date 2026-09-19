import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import { createRule, getParserServices, matchesTypeOrBaseType } from '../util';

export default createRule({
  name: 'no-object-literal-class-instances',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow object literals where a class instance is expected',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      nonInstance:
        'This value is used where an instance of class `{{type}}` is expected, but was not created by its constructor.',
      objectLiteral:
        'This object literal is used where an instance of class `{{type}}` is expected.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function getClassTarget(type: ts.Type): ts.Type | undefined {
      if (!tsutils.isObjectType(type)) {
        return undefined;
      }

      const target = tsutils.isTypeReference(type) ? type.target : type;

      return tsutils.isObjectFlagSet(target, ts.ObjectFlags.Class)
        ? target
        : undefined;
    }

    function getNominalClass(type: ts.Type): ts.Type | undefined {
      let found: ts.Type | undefined;

      matchesTypeOrBaseType(
        services,
        candidate => {
          if (getClassTarget(candidate)) {
            found = candidate;
          }
          return !!found;
        },
        type,
      );

      return found;
    }

    function resolveConstraint(type: ts.Type): ts.Type | undefined {
      return tsutils.isTypeFlagSet(type, ts.TypeFlags.Instantiable)
        ? checker.getBaseConstraintOfType(type)
        : type;
    }

    function containsClass(type: ts.Type, seen = new Set<ts.Type>()): boolean {
      if (seen.has(type)) {
        return false;
      }
      seen.add(type);

      const resolved = resolveConstraint(type);
      if (!resolved) {
        return false;
      }

      if (tsutils.isUnionOrIntersectionType(resolved)) {
        return resolved.types.some(part => containsClass(part, seen));
      }

      return (
        !!getNominalClass(resolved) ||
        (tsutils.isTypeReference(resolved) &&
          checker
            .getTypeArguments(resolved)
            .some(typeArgument => containsClass(typeArgument, seen))) ||
        checker
          .getIndexInfosOfType(resolved)
          .some(indexInfo => containsClass(indexInfo.type, seen))
      );
    }

    function isInstanceOf(source: ts.Type, classType: ts.Type): boolean {
      const classTarget = getClassTarget(classType);

      return tsutils
        .intersectionConstituents(source)
        .some(
          part =>
            (tsutils.isObjectType(part) &&
              tsutils.isObjectFlagSet(part, ts.ObjectFlags.Mapped)) ||
            matchesTypeOrBaseType(
              services,
              type => getClassTarget(type) === classTarget,
              part,
            ),
        );
    }

    function findFirstViolation<T>(
      items: readonly T[],
      find: (item: T, index: number) => ts.Type | undefined,
    ): ts.Type | undefined {
      for (const [i, item] of items.entries()) {
        const violation = find(item, i);
        if (violation) {
          return violation;
        }
      }
      return undefined;
    }

    function findViolation(
      source: ts.Type,
      target: ts.Type,
      shallow: boolean,
    ): ts.Type | undefined {
      const resolvedSource = resolveConstraint(source);
      const resolvedTarget = resolveConstraint(target);

      if (
        !resolvedSource ||
        !resolvedTarget ||
        resolvedSource === resolvedTarget ||
        tsutils.isTypeFlagSet(
          resolvedSource,
          ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.Never,
        ) ||
        !containsClass(resolvedTarget)
      ) {
        return undefined;
      }

      if (resolvedSource.isUnion()) {
        return findFirstViolation(
          resolvedSource.types.filter(part =>
            checker.isTypeAssignableTo(part, resolvedTarget),
          ),
          part => findViolation(part, resolvedTarget, shallow),
        );
      }

      if (
        !tsutils.isObjectType(resolvedSource) &&
        !(
          resolvedSource.isIntersection() &&
          !checker.isTypeAssignableTo(resolvedSource, checker.getNeverType())
        )
      ) {
        return undefined;
      }

      if (resolvedTarget.isUnion()) {
        const candidates = resolvedTarget.types.filter(part =>
          checker.isTypeAssignableTo(resolvedSource, part),
        );
        if (
          candidates.length === 0 ||
          candidates.some(candidate => !containsClass(candidate))
        ) {
          return undefined;
        }

        const violations = candidates.map(candidate =>
          findViolation(resolvedSource, candidate, shallow),
        );
        return violations.every(Boolean) ? violations[0] : undefined;
      }

      if (resolvedTarget.isIntersection()) {
        return findFirstViolation(resolvedTarget.types, part =>
          findViolation(resolvedSource, part, shallow),
        );
      }

      const nominalClass = getNominalClass(resolvedTarget);
      if (nominalClass && !isInstanceOf(resolvedSource, nominalClass)) {
        return nominalClass;
      }

      if (shallow) {
        return undefined;
      }

      if (
        tsutils.isTypeReference(resolvedSource) &&
        tsutils.isTypeReference(resolvedTarget) &&
        resolvedSource.target === resolvedTarget.target
      ) {
        const sourceArguments = checker.getTypeArguments(resolvedSource);
        return findFirstViolation(
          checker
            .getTypeArguments(resolvedTarget)
            .slice(0, sourceArguments.length),
          (targetArgument, i) =>
            findViolation(sourceArguments[i], targetArgument, false),
        );
      }

      return findFirstViolation(
        [ts.IndexKind.Number, ts.IndexKind.String],
        indexKind => {
          const sourceIndexType = checker.getIndexTypeOfType(
            resolvedSource,
            indexKind,
          );
          const targetIndexType = checker.getIndexTypeOfType(
            resolvedTarget,
            indexKind,
          );
          return (
            sourceIndexType &&
            targetIndexType &&
            findViolation(sourceIndexType, targetIndexType, false)
          );
        },
      );
    }

    function checkSite(node: TSESTree.Expression): void {
      switch (node.type) {
        case AST_NODE_TYPES.ArrowFunctionExpression:
        case AST_NODE_TYPES.ConditionalExpression:
        case AST_NODE_TYPES.FunctionExpression:
        case AST_NODE_TYPES.LogicalExpression:
        case AST_NODE_TYPES.SequenceExpression:
          return;
      }

      const contextualType = checker.getContextualType(
        services.esTreeNodeToTSNodeMap.get(node) as ts.Expression,
      );
      if (!contextualType) {
        return;
      }

      const isLiteral =
        node.type === AST_NODE_TYPES.ObjectExpression ||
        node.type === AST_NODE_TYPES.ArrayExpression;
      const violation = findViolation(
        services.getTypeAtLocation(node),
        contextualType,
        isLiteral,
      );

      if (violation) {
        context.report({
          node,
          messageId:
            node.type === AST_NODE_TYPES.ObjectExpression
              ? 'objectLiteral'
              : 'nonInstance',
          data: { type: checker.typeToString(violation) },
        });
      }
    }

    function checkArguments(
      node: TSESTree.CallExpression | TSESTree.NewExpression,
    ): void {
      for (const argument of node.arguments) {
        if (argument.type !== AST_NODE_TYPES.SpreadElement) {
          checkSite(argument);
        }
      }
    }

    return {
      ArrayExpression(node) {
        for (const element of node.elements) {
          if (element && element.type !== AST_NODE_TYPES.SpreadElement) {
            checkSite(element);
          }
        }
      },
      ArrowFunctionExpression(node) {
        if (node.body.type !== AST_NODE_TYPES.BlockStatement) {
          checkSite(node.body);
        }
      },
      AssignmentExpression(node) {
        if (['=', '&&=', '??=', '||='].includes(node.operator)) {
          checkSite(node.right);
        }
      },
      AssignmentPattern(node) {
        checkSite(node.right);
      },
      CallExpression: checkArguments,
      ConditionalExpression(node) {
        checkSite(node.consequent);
        checkSite(node.alternate);
      },
      JSXExpressionContainer(node) {
        if (node.expression.type !== AST_NODE_TYPES.JSXEmptyExpression) {
          checkSite(node.expression);
        }
      },
      LogicalExpression(node) {
        checkSite(node.left);
        checkSite(node.right);
      },
      NewExpression: checkArguments,
      'Property[parent.type="ObjectExpression"]'(node: TSESTree.Property) {
        checkSite(node.value as TSESTree.Expression);
      },
      'PropertyDefinition, AccessorProperty'(
        node: TSESTree.AccessorProperty | TSESTree.PropertyDefinition,
      ) {
        if (node.value) {
          checkSite(node.value);
        }
      },
      ReturnStatement(node) {
        if (node.argument) {
          checkSite(node.argument);
        }
      },
      SequenceExpression(node) {
        checkSite(node.expressions[node.expressions.length - 1]);
      },
      'TSAsExpression, TSSatisfiesExpression, TSTypeAssertion'(
        node:
          | TSESTree.TSAsExpression
          | TSESTree.TSSatisfiesExpression
          | TSESTree.TSTypeAssertion,
      ) {
        checkSite(node.expression);
      },
      VariableDeclarator(node) {
        if (node.init) {
          checkSite(node.init);
        }
      },
      YieldExpression(node) {
        if (node.argument) {
          checkSite(node.argument);
        }
      },
    };
  },
});
