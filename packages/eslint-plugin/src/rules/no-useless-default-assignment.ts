import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getParserServices,
  isFunction,
  isTypeAnyType,
  isTypeFlagSet,
  isTypeUnknownType,
  nullThrows,
  NullThrowsReasons,
} from '../util';

type MessageId =
  | 'preferOptionalSyntax'
  | 'uselessDefaultAssignment'
  | 'uselessUndefined';

export default createRule<[], MessageId>({
  name: 'no-useless-default-assignment',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow default values that will never be used',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      preferOptionalSyntax:
        'Using `= undefined` to make a parameter optional adds unnecessary runtime logic. Use the `?` optional syntax instead.',
      uselessDefaultAssignment:
        'Default value is useless because the {{ type }} is not optional.',
      uselessUndefined:
        'Default value is useless because it is undefined. Optional {{ type }}s are already undefined by default.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function canBeUndefined(type: ts.Type): boolean {
      if (isTypeAnyType(type) || isTypeUnknownType(type)) {
        return true;
      }
      return tsutils
        .unionConstituents(type)
        .some(part => isTypeFlagSet(part, ts.TypeFlags.Undefined));
    }

    function getArrayElementType(
      arrayType: ts.Type,
      elementIndex: number,
    ): ts.Type | null {
      if (checker.isTupleType(arrayType)) {
        const tupleArgs = checker.getTypeArguments(arrayType);
        if (elementIndex < tupleArgs.length) {
          return tupleArgs[elementIndex];
        }
      }

      return arrayType.getNumberIndexType() ?? null;
    }

    function checkAssignmentPattern(node: TSESTree.AssignmentPattern): void {
      if (
        node.right.type === AST_NODE_TYPES.Identifier &&
        node.right.name === 'undefined'
      ) {
        const tsNode = services.esTreeNodeToTSNodeMap.get(node);
        if (
          ts.isParameter(tsNode) &&
          tsNode.type &&
          canBeUndefined(checker.getTypeFromTypeNode(tsNode.type))
        ) {
          reportPreferOptionalSyntax(node);
          return;
        }

        const type =
          node.parent.type === AST_NODE_TYPES.Property ||
          node.parent.type === AST_NODE_TYPES.ArrayPattern
            ? 'property'
            : 'parameter';
        reportUselessUndefined(node, type);
        return;
      }

      const parent = node.parent;

      if (
        parent.type === AST_NODE_TYPES.ArrowFunctionExpression ||
        parent.type === AST_NODE_TYPES.FunctionExpression
      ) {
        const paramIndex = parent.params.indexOf(node);
        if (paramIndex !== -1) {
          const tsFunc = services.esTreeNodeToTSNodeMap.get(parent);
          if (ts.isFunctionLike(tsFunc)) {
            const contextualType = checker.getContextualType(
              tsFunc as ts.Expression,
            );
            if (!contextualType) {
              return;
            }

            const signatures = contextualType.getCallSignatures();
            if (
              signatures.length === 0 ||
              signatures[0].getDeclaration() === tsFunc
            ) {
              return;
            }

            const params = signatures[0].getParameters();
            if (paramIndex < params.length) {
              const paramSymbol = params[paramIndex];
              if ((paramSymbol.flags & ts.SymbolFlags.Optional) === 0) {
                const paramType = checker.getTypeOfSymbol(paramSymbol);
                if (!canBeUndefined(paramType)) {
                  reportUselessDefaultAssignment(node, 'parameter');
                }
              }
            }
          }
        }
        return;
      }

      if (parent.type === AST_NODE_TYPES.Property) {
        const propertyType = getTypeOfProperty(parent);
        if (!propertyType) {
          return;
        }

        if (!canBeUndefined(propertyType)) {
          reportUselessDefaultAssignment(node, 'property');
        }
      } else if (parent.type === AST_NODE_TYPES.ArrayPattern) {
        const sourceType = getSourceTypeForPattern(parent);
        if (!sourceType) {
          return;
        }

        if (!checker.isTupleType(sourceType)) {
          return;
        }

        const tupleArgs = checker.getTypeArguments(sourceType);
        const elementIndex = parent.elements.indexOf(node);
        if (elementIndex < 0 || elementIndex >= tupleArgs.length) {
          return;
        }
        const elementType = tupleArgs[elementIndex];
        if (!canBeUndefined(elementType)) {
          reportUselessDefaultAssignment(node, 'property');
        }
      }
    }

    function getTypeOfProperty(node: TSESTree.Property): ts.Type | null {
      const objectPattern = node.parent as TSESTree.ObjectPattern;
      const sourceType = getSourceTypeForPattern(objectPattern);
      if (!sourceType) {
        return null;
      }

      const propertyName = getPropertyName(node.key);
      if (!propertyName) {
        return null;
      }

      const symbol = sourceType.getProperty(propertyName);
      if (!symbol) {
        return null;
      }

      if (
        symbol.flags & ts.SymbolFlags.Optional &&
        hasConditionalInitializer(objectPattern)
      ) {
        return null;
      }

      return checker.getTypeOfSymbol(symbol);
    }

    function hasConditionalInitializer(node: TSESTree.Node): boolean {
      const parent = node.parent;
      if (!parent) {
        return false;
      }
      if (parent.type === AST_NODE_TYPES.VariableDeclarator && parent.init) {
        return (
          parent.init.type === AST_NODE_TYPES.ConditionalExpression ||
          parent.init.type === AST_NODE_TYPES.LogicalExpression
        );
      }
      return hasConditionalInitializer(parent);
    }

    function getSourceTypeForPattern(pattern: TSESTree.Node): ts.Type | null {
      const parent = nullThrows(
        pattern.parent,
        NullThrowsReasons.MissingParent,
      );

      if (parent.type === AST_NODE_TYPES.VariableDeclarator && parent.init) {
        const tsNode = services.esTreeNodeToTSNodeMap.get(parent.init);
        return checker.getTypeAtLocation(tsNode);
      }

      if (isFunction(parent)) {
        const paramIndex = parent.params.indexOf(pattern as TSESTree.Parameter);
        const tsFunc = services.esTreeNodeToTSNodeMap.get(parent);
        const signature = nullThrows(
          checker.getSignatureFromDeclaration(tsFunc),
          NullThrowsReasons.MissingToken('signature', 'function'),
        );
        const params = signature.getParameters();
        return checker.getTypeOfSymbol(params[paramIndex]);
      }

      if (parent.type === AST_NODE_TYPES.AssignmentPattern) {
        return getSourceTypeForPattern(parent);
      }

      if (parent.type === AST_NODE_TYPES.Property) {
        return getTypeOfProperty(parent);
      }

      if (parent.type === AST_NODE_TYPES.ArrayPattern) {
        const arrayType = getSourceTypeForPattern(parent);
        if (!arrayType) {
          return null;
        }
        const elementIndex = parent.elements.indexOf(
          pattern as TSESTree.DestructuringPattern,
        );
        return getArrayElementType(arrayType, elementIndex);
      }

      return null;
    }

    function getPropertyName(
      key: TSESTree.Expression | TSESTree.PrivateIdentifier,
    ): string | null {
      switch (key.type) {
        case AST_NODE_TYPES.Identifier:
          return key.name;
        case AST_NODE_TYPES.Literal:
          return String(key.value);
        default:
          return null;
      }
    }

    function reportUselessDefaultAssignment(
      node: TSESTree.AssignmentPattern,
      type: 'parameter' | 'property',
    ): void {
      context.report({
        node: node.right,
        messageId: 'uselessDefaultAssignment',
        data: { type },
        fix: fixer => removeDefault(fixer, node),
      });
    }

    function reportUselessUndefined(
      node: TSESTree.AssignmentPattern,
      type: 'parameter' | 'property',
    ): void {
      context.report({
        node: node.right,
        messageId: 'uselessUndefined',
        data: { type },
        fix: fixer => removeDefault(fixer, node),
      });
    }

    function reportPreferOptionalSyntax(
      node: TSESTree.AssignmentPattern,
    ): void {
      context.report({
        node: node.right,
        messageId: 'preferOptionalSyntax',
        *fix(fixer) {
          yield removeDefault(fixer, node);

          const { left } = node;
          if (left.type === AST_NODE_TYPES.Identifier) {
            yield fixer.insertTextAfterRange(
              [left.range[0], left.range[0] + left.name.length],
              '?',
            );
          }
        },
      });
    }

    function removeDefault(
      fixer: TSESLint.RuleFixer,
      node: TSESTree.AssignmentPattern,
    ): TSESLint.RuleFix {
      const start = node.left.range[1];
      const end = node.range[1];
      return fixer.removeRange([start, end]);
    }

    return {
      AssignmentPattern: checkAssignmentPattern,
    };
  },
});
