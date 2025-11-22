import type { TSESTree } from '@typescript-eslint/utils';

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
} from '../util';

type MessageId = 'uselessDefaultAssignment';

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
      uselessDefaultAssignment:
        'Default value is useless because the {{ type }} is not optional.',
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

    function getPropertyType(
      objectType: ts.Type,
      propertyName: string,
    ): ts.Type | null {
      const symbol = objectType.getProperty(propertyName);
      if (!symbol) {
        return null;
      }
      return checker.getTypeOfSymbol(symbol);
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
            if (signatures.length === 0) {
              return;
            }

            const signature = signatures[0];
            const params = signature.getParameters();
            if (paramIndex < params.length) {
              const paramSymbol = params[paramIndex];
              if ((paramSymbol.flags & ts.SymbolFlags.Optional) === 0) {
                const paramType = checker.getTypeOfSymbol(paramSymbol);
                if (!canBeUndefined(paramType)) {
                  reportUselessDefault(node, 'parameter');
                }
              }
            }
          }
        }
        return;
      }

      if (parent.type === AST_NODE_TYPES.Property) {
        const objectPattern = parent.parent as TSESTree.ObjectPattern;

        const sourceType = getSourceTypeForPattern(objectPattern);
        if (!sourceType) {
          return;
        }

        const propertyName = getPropertyName(parent.key);
        if (!propertyName) {
          return;
        }

        const propertyType = getPropertyType(sourceType, propertyName);
        if (!propertyType) {
          return;
        }

        if (!canBeUndefined(propertyType)) {
          reportUselessDefault(node, 'property');
        }
      } else if (parent.type === AST_NODE_TYPES.ArrayPattern) {
        const sourceType = getSourceTypeForPattern(parent);
        if (!sourceType) {
          return;
        }

        const elementIndex = parent.elements.indexOf(node);
        if (elementIndex === -1) {
          return;
        }

        const elementType = getArrayElementType(sourceType, elementIndex);
        if (!elementType) {
          return;
        }

        if (!canBeUndefined(elementType)) {
          reportUselessDefault(node, 'property');
        }
      }
    }

    function getSourceTypeForPattern(pattern: TSESTree.Node): ts.Type | null {
      const parent = pattern.parent;
      if (!parent) {
        return null;
      }

      if (parent.type === AST_NODE_TYPES.VariableDeclarator && parent.init) {
        const tsNode = services.esTreeNodeToTSNodeMap.get(parent.init);
        return checker.getTypeAtLocation(tsNode);
      }

      if (isFunction(parent)) {
        const paramIndex = parent.params.indexOf(pattern as TSESTree.Parameter);
        const tsFunc = services.esTreeNodeToTSNodeMap.get(parent);
        const signature = checker.getSignatureFromDeclaration(tsFunc);
        if (!signature) {
          return null;
        }
        const params = signature.getParameters();
        return checker.getTypeOfSymbol(params[paramIndex]);
      }

      if (parent.type === AST_NODE_TYPES.AssignmentPattern) {
        return getSourceTypeForPattern(parent);
      }

      if (parent.type === AST_NODE_TYPES.Property) {
        const objectPattern = parent.parent as TSESTree.ObjectPattern;
        const objectType = getSourceTypeForPattern(objectPattern);
        if (!objectType) {
          return null;
        }
        const propertyName = getPropertyName(parent.key);
        if (!propertyName) {
          return null;
        }
        return getPropertyType(objectType, propertyName);
      }

      if (parent.type === AST_NODE_TYPES.ArrayPattern) {
        const arrayPattern = parent;
        const arrayType = getSourceTypeForPattern(arrayPattern);
        if (!arrayType) {
          return null;
        }
        const elementIndex = arrayPattern.elements.indexOf(
          pattern as TSESTree.DestructuringPattern,
        );
        if (elementIndex === -1) {
          return null;
        }
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

    function reportUselessDefault(
      node: TSESTree.AssignmentPattern,
      type: 'parameter' | 'property',
    ): void {
      context.report({
        node: node.right,
        messageId: 'uselessDefaultAssignment',
        data: { type },
        fix(fixer) {
          // Remove from before the = to the end of the default value
          // Find the start position (including whitespace before =)
          const start = node.left.range[1];
          const end = node.range[1];
          return fixer.removeRange([start, end]);
        },
      });
    }

    return {
      AssignmentPattern: checkAssignmentPattern,
    };
  },
});
