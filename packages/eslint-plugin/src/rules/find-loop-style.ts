import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';

export default util.createRule({
  name: 'find-loop-style',
  meta: {
    docs: {
      description:
        'Enforce one style of finding an element in an array where possible',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      preferFind: 'This loop can be simplified by switching to .find',
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    const sourceCode = context.getSourceCode();

    return {
      /* TODO: Case: storing a variable and populating it in a loop
      Input:
        let result: string | undefined = undefined;
        for (const item of array) {
          if (condition(item)) {
            result = item;
            break;
          }
        }
      Output:
        let result = array.find((item) => condition(item));
       */
      /* Case: the last statement in a for-of loop that can switch to .find
      Input:
        for (const item of array) {
          if (condition(item)) {
            return item;
          }
        }
      Output:
        return array.find(item => condition(item));
      */
      // TODO: Support for (let i = 0; i < array.length i += 1) loops too
      // TODO: Support enforcing the other two styles, too (as an option)
      ForOfStatement(node): void {
        const esNode = parserServices.esTreeNodeToTSNodeMap.get(node.right);
        const type = util.getConstrainedTypeAtLocation(checker, esNode);
        if (!util.isTypeArrayTypeOrUnionOfArrayTypes(type, checker)) {
          return;
        }

        const item = getLoopItem(node);
        if (!item) {
          return;
        }

        const bodyStatements = getBodyStatements(node.body);
        const ifStatement = bodyStatements[bodyStatements.length - 1];
        if (ifStatement?.type !== AST_NODE_TYPES.IfStatement) {
          return;
        }

        const returnStatement = getLastBlockStatement(ifStatement.consequent);
        if (
          returnStatement?.type !== AST_NODE_TYPES.ReturnStatement ||
          returnStatement.argument?.type !== AST_NODE_TYPES.Identifier ||
          returnStatement.argument.name !== item.name
        ) {
          return;
        }

        context.report({
          fix(fixer) {
            const iterateeText = sourceCode.getText(node.right);
            const testText = sourceCode.getText(ifStatement.test);

            return fixer.replaceText(
              node,
              [
                `return ${iterateeText}.find(${item.name} => {`,
                ...bodyStatements
                  .slice(0, bodyStatements.length - 1)
                  .map(
                    bodyStatement => `  ${sourceCode.getText(bodyStatement)}`,
                  ),
                `  return ${testText};`,
                `});`,
              ].join('\n'),
            );
          },
          messageId: 'preferFind',
          node,
        });
      },
    };
  },
});

function getLoopItem(
  node: TSESTree.ForOfStatement,
): TSESTree.Identifier | undefined {
  return node.left.type === AST_NODE_TYPES.VariableDeclaration &&
    node.left.declarations.length === 1 &&
    node.left.declarations[0].id.type == AST_NODE_TYPES.Identifier
    ? node.left.declarations[0].id
    : undefined;
}

function getBodyStatements(node: TSESTree.Statement): TSESTree.Statement[] {
  return node.type === AST_NODE_TYPES.BlockStatement ? node.body : [node];
}

function getLastBlockStatement(
  node: TSESTree.Statement,
): TSESTree.Statement | undefined {
  const statements = getBodyStatements(node);
  return statements.length === 1 ? statements[0] : undefined;
}
