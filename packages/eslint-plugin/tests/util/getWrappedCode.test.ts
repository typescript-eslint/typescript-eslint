import type { TSESTree } from '@typescript-eslint/utils';

import * as ts from 'typescript';

import {
  createRule,
  getOperatorPrecedence,
  getParserServices,
} from '../../src/util';
import { getWrappedCode } from '../../src/util/getWrappedCode';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
    },
  },
});

const removeFunctionRule = createRule({
  create(context) {
    const parserServices = getParserServices(context, true);

    const report = (node: TSESTree.CallExpression): void => {
      context.report({
        fix: fixer => {
          const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
          const tsArgumentNode = tsNode.arguments[0];

          const nodePrecedence = getOperatorPrecedence(
            tsArgumentNode.kind,
            ts.isBinaryExpression(tsArgumentNode)
              ? tsArgumentNode.operatorToken.kind
              : ts.SyntaxKind.Unknown,
          );
          const parentPrecedence = getOperatorPrecedence(
            tsNode.parent.kind,
            ts.isBinaryExpression(tsNode.parent)
              ? tsNode.parent.operatorToken.kind
              : ts.SyntaxKind.Unknown,
          );

          const text = context.sourceCode.getText(node.arguments[0]);
          return fixer.replaceText(
            node,
            getWrappedCode(text, nodePrecedence, parentPrecedence),
          );
        },
        messageId: 'removeFunction',
        node,
      });
    };

    return {
      'CallExpression[callee.name="fn"]': report,
    };
  },
  defaultOptions: [],
  meta: {
    docs: {
      description:
        'Remove function with first arg remaining in random places for test purposes.',
    },
    fixable: 'code',
    messages: {
      removeFunction: 'Please remove this function',
    },
    schema: [],
    type: 'suggestion',
  },

  name: 'remove-function',
});

ruleTester.run('getWrappedCode - removeFunctionRule', removeFunctionRule, {
  invalid: [
    // should add parens when the first argument node has lower precedence than the parent node of the CallExpression
    {
      code: '() => fn({ x: "wrapObject" })',
      errors: [{ messageId: 'removeFunction' }],
      output: '() => ({ x: "wrapObject" })',
    },

    // shouldn't add parens when not necessary
    {
      code: 'const a = fn({ x: "wrapObject" })',
      errors: [{ messageId: 'removeFunction' }],
      output: 'const a = { x: "wrapObject" }',
    },
  ],
  valid: [],
});
