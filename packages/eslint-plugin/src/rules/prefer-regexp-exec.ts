import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  createRule,
  getParserServices,
  getStaticValue,
  getTypeName,
  getWrappingFixer,
} from '../util';

export default createRule({
  name: 'prefer-regexp-exec',
  defaultOptions: [],

  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Enforce that `RegExp#exec` is used instead of `String#match` if no global flag is provided',
      category: 'Best Practices',
      recommended: 'error',
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
     * Check if a given node is a string.
     * @param node The node to check.
     */
    function isStringType(node: TSESTree.Node): boolean {
      const objectType = typeChecker.getTypeAtLocation(
        parserServices.esTreeNodeToTSNodeMap.get(node),
      );
      return getTypeName(typeChecker, objectType) === 'string';
    }

    /**
     * Check if a given node is a RegExp.
     * @param node The node to check.
     */
    function isRegExpType(node: TSESTree.Node): boolean {
      const objectType = typeChecker.getTypeAtLocation(
        parserServices.esTreeNodeToTSNodeMap.get(node),
      );
      return getTypeName(typeChecker, objectType) === 'RegExp';
    }

    return {
      "CallExpression[arguments.length=1] > MemberExpression.callee[property.name='match'][computed=false]"(
        memberNode: TSESTree.MemberExpression,
      ): void {
        const objectNode = memberNode.object;
        const callNode = memberNode.parent as TSESTree.CallExpression;
        const argumentNode = callNode.arguments[0];
        const argumentValue = getStaticValue(argumentNode, globalScope);

        if (!isStringType(objectNode)) {
          return;
        }

        // Don't report regular expressions with global flag.
        if (
          argumentValue &&
          argumentValue.value instanceof RegExp &&
          argumentValue.value.flags.includes('g')
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

        if (isRegExpType(argumentNode)) {
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
        }

        if (isStringType(argumentNode)) {
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

        return context.report({
          node: memberNode.property,
          messageId: 'regExpExecOverStringMatch',
        });
      },
    };
  },
});
