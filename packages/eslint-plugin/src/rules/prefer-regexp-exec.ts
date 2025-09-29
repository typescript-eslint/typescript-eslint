import type { TSESTree } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';

import {
  createRule,
  getParserServices,
  getStaticValue,
  getTypeName,
  getWrappingFixer,
  isStaticMemberAccessOfValue,
} from '../util';

enum ArgumentType {
  Other = 0,
  String = 1 << 0,
  RegExp = 1 << 1,
  Both = String | RegExp,
}

export default createRule({
  name: 'prefer-regexp-exec',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce `RegExp#exec` over `String#match` if no global flag is provided',
      recommended: 'stylistic',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      regExpExecOverStringMatch: 'Use the `RegExp#exec()` method instead.',
    },
    schema: [],
  },

  defaultOptions: [],

  create(context) {
    const globalScope = context.sourceCode.getScope(context.sourceCode.ast);
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    /**
     * Check if a given node type is a string.
     * @param type The node type to check.
     */
    function isStringType(type: ts.Type): boolean {
      return getTypeName(checker, type) === 'string';
    }

    /**
     * Check if a given node type is a RegExp.
     * @param type The node type to check.
     */
    function isRegExpType(type: ts.Type): boolean {
      return getTypeName(checker, type) === 'RegExp';
    }

    function collectArgumentTypes(types: ts.Type[]): ArgumentType {
      let result = ArgumentType.Other;

      for (const type of types) {
        if (isRegExpType(type)) {
          result |= ArgumentType.RegExp;
        } else if (isStringType(type)) {
          result |= ArgumentType.String;
        }
      }

      return result;
    }

    /**
     * Returns true if and only if we have syntactic proof that the /g flag is
     * absent. Returns false in all other cases (i.e. it still might or might
     * not contain the global flag).
     */
    function definitelyDoesNotContainGlobalFlag(
      node: TSESTree.CallExpressionArgument,
    ): boolean {
      if (
        (node.type === AST_NODE_TYPES.CallExpression ||
          node.type === AST_NODE_TYPES.NewExpression) &&
        node.callee.type === AST_NODE_TYPES.Identifier &&
        node.callee.name === 'RegExp'
      ) {
        const flags = node.arguments.at(1);
        return !(
          flags?.type === AST_NODE_TYPES.Literal &&
          typeof flags.value === 'string' &&
          flags.value.includes('g')
        );
      }

      return false;
    }

    return {
      'CallExpression[arguments.length=1] > MemberExpression'(
        memberNode: TSESTree.MemberExpression,
      ): void {
        if (!isStaticMemberAccessOfValue(memberNode, context, 'match')) {
          return;
        }
        const objectNode = memberNode.object;
        const callNode = memberNode.parent as TSESTree.CallExpression;
        const [argumentNode] = callNode.arguments;
        const argumentValue = getStaticValue(argumentNode, globalScope);

        if (!isStringType(services.getTypeAtLocation(objectNode))) {
          return;
        }

        // Don't report regular expressions with global flag.
        if (
          (!argumentValue &&
            !definitelyDoesNotContainGlobalFlag(argumentNode)) ||
          (argumentValue &&
            argumentValue.value instanceof RegExp &&
            argumentValue.value.flags.includes('g'))
        ) {
          return;
        }

        if (
          argumentNode.type === AST_NODE_TYPES.Literal &&
          typeof argumentNode.value === 'string'
        ) {
          let regExp: RegExp;
          try {
            regExp = RegExp(argumentNode.value);
          } catch {
            return;
          }
          return context.report({
            node: memberNode.property,
            messageId: 'regExpExecOverStringMatch',
            fix: getWrappingFixer({
              node: callNode,
              innerNode: [objectNode],
              sourceCode: context.sourceCode,
              wrap: objectCode => `${regExp.toString()}.exec(${objectCode})`,
            }),
          });
        }

        const argumentType = services.getTypeAtLocation(argumentNode);
        const argumentTypes = collectArgumentTypes(
          tsutils.unionConstituents(argumentType),
        );
        switch (argumentTypes) {
          case ArgumentType.RegExp:
            return context.report({
              node: memberNode.property,
              messageId: 'regExpExecOverStringMatch',
              fix: getWrappingFixer({
                node: callNode,
                innerNode: [objectNode, argumentNode],
                sourceCode: context.sourceCode,
                wrap: (objectCode, argumentCode) =>
                  `${argumentCode}.exec(${objectCode})`,
              }),
            });

          case ArgumentType.String:
            return context.report({
              node: memberNode.property,
              messageId: 'regExpExecOverStringMatch',
              fix: getWrappingFixer({
                node: callNode,
                innerNode: [objectNode, argumentNode],
                sourceCode: context.sourceCode,
                wrap: (objectCode, argumentCode) =>
                  `RegExp(${argumentCode}).exec(${objectCode})`,
              }),
            });
        }
      },
    };
  },
});
