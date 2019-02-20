/**
 * @fileoverview Prefer RegExp#exec() over String#match()
 * @author Ricky Lippmann <https://github.com/ldrick>
 */

import { TSESTree } from '@typescript-eslint/typescript-estree';
import ts from 'typescript';
import { createRule, getParserServices } from '../util';
import { getStaticValue } from 'eslint-utils';

export default createRule({
  name: 'prefer-regexp-exec',
  defaultOptions: [],

  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer RegExp#exec() over String#match() if no global flag is provided.',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      regExpExecOverStringMatch: 'Use RegExp#exec() method instead.',
    },
    schema: [],
  },

  create(context) {
    const globalScope = context.getScope();
    const service = getParserServices(context);
    const typeChecker = service.program.getTypeChecker();

    /**
     * Get the type name of a given type.
     * @param type The type to get.
     */
    function getTypeName(type: ts.Type): string {
      // It handles `string` and string literal types as string.
      if ((type.flags & ts.TypeFlags.StringLike) !== 0) {
        return 'string';
      }

      // If the type is a type parameter which extends primitive string types,
      // but it was not recognized as a string like. So check the constraint
      // type of the type parameter.
      if ((type.flags & ts.TypeFlags.TypeParameter) !== 0) {
        // `type.getConstraint()` method doesn't return the constraint type of
        // the type parameter for some reason. So this gets the constraint type
        // via AST.
        const node = type.symbol.declarations[0] as ts.TypeParameterDeclaration;
        if (node.constraint != null) {
          return getTypeName(typeChecker.getTypeFromTypeNode(node.constraint));
        }
      }

      // If the type is a union and all types in the union are string like,
      // return `string`. For example:
      // - `"a" | "b"` is string.
      // - `string | string[]` is not string.
      if (
        type.isUnion() &&
        type.types.map(getTypeName).every(t => t === 'string')
      ) {
        return 'string';
      }

      // If the type is an intersection and a type in the intersection is string
      // like, return `string`. For example: `string & {__htmlEscaped: void}`
      if (
        type.isIntersection() &&
        type.types.map(getTypeName).some(t => t === 'string')
      ) {
        return 'string';
      }

      return typeChecker.typeToString(type);
    }

    /**
     * Check if a given node is a string.
     * @param node The node to check.
     */
    function isStringType(node: TSESTree.Node): boolean {
      const objectType = typeChecker.getTypeAtLocation(
        service.esTreeNodeToTSNodeMap.get(node),
      );
      const typeName = getTypeName(objectType);

      return typeName === 'string';
    }

    return {
      "CallExpression[arguments.length=1] > MemberExpression.callee[property.name='match'][computed=false]"(
        node: TSESTree.MemberExpression,
      ) {
        const callNode = node.parent as TSESTree.CallExpression;
        const arg = callNode.arguments[0];
        const evaluated = getStaticValue(arg, globalScope);

        // Do not run for global flag.
        if (
          evaluated &&
          evaluated.value instanceof RegExp &&
          evaluated.value.flags.includes('g')
        ) {
          return;
        }

        if (isStringType(node.object)) {
          context.report({
            node: callNode,
            messageId: 'regExpExecOverStringMatch',
          });
          return;
        }
      },
    };
  },
});
