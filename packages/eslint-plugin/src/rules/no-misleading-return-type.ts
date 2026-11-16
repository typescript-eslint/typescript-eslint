import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getParserServices,
  isSymbolFromDefaultLibrary,
  isTypeAnyType,
  isTypeNeverType,
  isTypeUnknownType,
  walkStatements,
} from '../util';

type FunctionNode =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression;

export default createRule({
  name: 'no-misleading-return-type',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow return type annotations containing types not required by returned expressions',
      requiresTypeChecking: true,
    },
    messages: {
      unnecessaryType: 'No returned expression requires this type.',
    },
    schema: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function getUnionMembers(type: TSESTree.TypeNode): TSESTree.TypeNode[] {
      return type.type === AST_NODE_TYPES.TSUnionType
        ? type.types.flatMap(getUnionMembers)
        : [type];
    }

    function isAnyOrUnknown(type: ts.Type): boolean {
      return isTypeAnyType(type) || isTypeUnknownType(type);
    }

    // Returns `null` when the types tell nothing about the returned values, as
    // `any`, `unknown` and `never` do.
    function getConstituents(types: readonly ts.Type[]): ts.Type[] | null {
      const constituents = types
        .flatMap(type => tsutils.unionConstituents(type))
        .filter(type => !isTypeNeverType(type));

      return constituents.length === 0 || constituents.some(isAnyOrUnknown)
        ? null
        : constituents;
    }

    // An async function awaits a returned promise before resolving with it.
    function getResolvedType(type: ts.Type, isAsync: boolean): ts.Type {
      return isAsync ? (checker.getAwaitedType(type) ?? type) : type;
    }

    function getReturnedTypes(node: FunctionNode): ts.Type[] | null {
      const expressions: TSESTree.Expression[] = [];
      let canCompleteWithoutValue = false;
      if (node.body.type === AST_NODE_TYPES.BlockStatement) {
        // This flag is set when the end of the body is reachable according to
        // the syntax alone. The function then also returns `undefined`.
        canCompleteWithoutValue = tsutils.isNodeFlagSet(
          services.esTreeNodeToTSNodeMap.get(node),
          ts.NodeFlags.HasImplicitReturn,
        );
        for (const statement of walkStatements(node.body.body)) {
          if (statement.type !== AST_NODE_TYPES.ReturnStatement) {
            continue;
          }

          if (statement.argument == null) {
            canCompleteWithoutValue = true;
          } else {
            expressions.push(statement.argument);
          }
        }
      } else {
        expressions.push(node.body);
      }

      // A function that never returns a value shows nothing about its type.
      if (expressions.length === 0) {
        return null;
      }

      const returnedTypes = expressions.map(expression =>
        services.getTypeAtLocation(expression),
      );
      if (canCompleteWithoutValue) {
        returnedTypes.push(checker.getUndefinedType());
      }

      return getConstituents(
        returnedTypes.map(type => getResolvedType(type, node.async)),
      );
    }

    // The return type of an async function is the global `Promise`.
    function getPromisedTypeNode(
      typeNode: TSESTree.TypeNode,
    ): TSESTree.TypeNode | undefined {
      if (typeNode.type !== AST_NODE_TYPES.TSTypeReference) {
        return undefined;
      }

      const symbol = services.getSymbolAtLocation(typeNode.typeName);

      return symbol?.name === 'Promise' &&
        isSymbolFromDefaultLibrary(services.program, symbol)
        ? typeNode.typeArguments?.params[0]
        : undefined;
    }

    function checkUnion(
      unionNode: TSESTree.TSUnionType,
      returnedTypes: readonly ts.Type[],
      isAwaited: boolean,
    ): void {
      const members = getUnionMembers(unionNode).map(typeNode => ({
        type: getResolvedType(services.getTypeAtLocation(typeNode), isAwaited),
        typeNode,
      }));
      // No member can be removed when one of them is `any` or `unknown`, or
      // when a returned type needs several of them.
      if (
        members.some(member => isAnyOrUnknown(member.type)) ||
        !returnedTypes.every(returnedType =>
          members.some(member =>
            checker.isTypeAssignableTo(returnedType, member.type),
          ),
        )
      ) {
        return;
      }

      for (const member of members) {
        const widerMembers = members.filter(
          other =>
            other !== member &&
            checker.isTypeAssignableTo(member.type, other.type),
        );
        // Removing `'a'` from `'a' | string` does not narrow the union.
        if (
          widerMembers.some(
            other => !checker.isTypeAssignableTo(other.type, member.type),
          )
        ) {
          continue;
        }

        const acceptedTypes = returnedTypes.filter(returnedType =>
          checker.isTypeAssignableTo(returnedType, member.type),
        );
        if (acceptedTypes.length === 0) {
          context.report({
            node: member.typeNode,
            messageId: 'unnecessaryType',
          });
        }
      }
    }

    function checkFunction(node: FunctionNode): void {
      const returnType = node.returnType?.typeAnnotation;
      if (returnType == null) {
        return;
      }

      const typeNode = node.async
        ? getPromisedTypeNode(returnType)
        : returnType;
      // Only a union member can be reported.
      if (typeNode?.type !== AST_NODE_TYPES.TSUnionType) {
        return;
      }

      const returnedTypes = getReturnedTypes(node);
      if (returnedTypes != null) {
        checkUnion(typeNode, returnedTypes, node.async);
      }
    }

    return {
      ArrowFunctionExpression: checkFunction,
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
    };
  },
});
