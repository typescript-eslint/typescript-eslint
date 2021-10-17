import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';
import {
  createRule,
  getParserServices,
  getStaticValue,
  getTypeName,
  getWrappingFixer,
} from '../util';

enum ArgumentType {
  Other = 0,
  String = 1 << 0,
  RegExp = 1 << 1,
  Both = String | RegExp,
}

export default createRule({
  name: 'prefer-regexp-exec',
  defaultOptions: [],

  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Enforce that `RegExp#exec` is used instead of `String#match` if no global flag is provided',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      regExpExecOverStringMatch: 'Use the `RegExp#exec()` method instead.',
    },
    schema: [],
  },

  create(context) {
    const globalScope = context.getScope();
    const parserServices = getParserServices(context);
    const typeChecker = parserServices.program.getTypeChecker();
    const sourceCode = context.getSourceCode();

    /**
     * Check if a given node type is a string.
     * @param node The node type to check.
     */
    function isStringType(type: ts.Type): boolean {
      return getTypeName(typeChecker, type) === 'string';
    }

    /**
     * Check if a given node type is a RegExp.
     * @param node The node type to check.
     */
    function isRegExpType(type: ts.Type): boolean {
      return getTypeName(typeChecker, type) === 'RegExp';
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

    function isLikelyToContainGlobalFlag(
      node: TSESTree.CallExpressionArgument,
    ): boolean {
      if (
        node.type === AST_NODE_TYPES.CallExpression ||
        node.type === AST_NODE_TYPES.NewExpression
      ) {
        const [, flags] = node.arguments;
        return (
          flags &&
          flags.type === AST_NODE_TYPES.Literal &&
          typeof flags.value === 'string' &&
          flags.value.includes('g')
        );
      }

      return node.type === AST_NODE_TYPES.Identifier;
    }

    return {
      "CallExpression[arguments.length=1] > MemberExpression.callee[property.name='match'][computed=false]"(
        memberNode: TSESTree.MemberExpression,
      ): void {
        const objectNode = memberNode.object;
        const callNode = memberNode.parent as TSESTree.CallExpression;
        const [argumentNode] = callNode.arguments;
        const argumentValue = getStaticValue(argumentNode, globalScope);

        if (
          !isStringType(
            typeChecker.getTypeAtLocation(
              parserServices.esTreeNodeToTSNodeMap.get(objectNode),
            ),
          )
        ) {
          return;
        }

        // Don't report regular expressions with global flag.
        if (
          (!argumentValue && isLikelyToContainGlobalFlag(argumentNode)) ||
          (argumentValue &&
            argumentValue.value instanceof RegExp &&
            argumentValue.value.flags.includes('g'))
        ) {
          return;
        }

        if (
          argumentNode.type === AST_NODE_TYPES.Literal &&
          typeof argumentNode.value == 'string'
        ) {
          const regExp = RegExp(argumentNode.value);
          return context.report({
            node: memberNode.property,
            messageId: 'regExpExecOverStringMatch',
            fix: getWrappingFixer({
              sourceCode,
              node: callNode,
              innerNode: [objectNode],
              wrap: objectCode => `${regExp.toString()}.exec(${objectCode})`,
            }),
          });
        }

        const argumentType = typeChecker.getTypeAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(argumentNode),
        );
        const argumentTypes = collectArgumentTypes(
          tsutils.unionTypeParts(argumentType),
        );
        switch (argumentTypes) {
          case ArgumentType.RegExp:
            return context.report({
              node: memberNode.property,
              messageId: 'regExpExecOverStringMatch',
              fix: getWrappingFixer({
                sourceCode,
                node: callNode,
                innerNode: [objectNode, argumentNode],
                wrap: (objectCode, argumentCode) =>
                  `${argumentCode}.exec(${objectCode})`,
              }),
            });

          case ArgumentType.String:
            return context.report({
              node: memberNode.property,
              messageId: 'regExpExecOverStringMatch',
              fix: getWrappingFixer({
                sourceCode,
                node: callNode,
                innerNode: [objectNode, argumentNode],
                wrap: (objectCode, argumentCode) =>
                  `RegExp(${argumentCode}).exec(${objectCode})`,
              }),
            });
        }
      },
    };
  },
});
