import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';

type Options = [
  {
    prefer?: Prefer;
  },
];

type Prefer = 'find' | 'for-counter' | 'for-of';

type MessageId =
  | 'preferFind'
  | 'preferForCounter'
  | 'preferForOf'
  | 'suggestFind'
  | 'suggestForCounter'
  | 'suggestForOf';

export default util.createRule<Options, MessageId>({
  name: 'find-loop-style',
  meta: {
    docs: {
      description:
        'Enforce one style of finding an element in an array where possible',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      suggestFind: 'Switch this find loop to use .find',
      suggestForCounter:
        'Switch this find loop to use a `for` loop over a counter.',
      suggestForOf: 'Switch this find loop to use a `for-of` loop.',
      preferFind: 'This find loop can be simplified by switching to .find',
      preferForCounter:
        'This find loop should be standardized by switching to a `for` loop over a counter.',
      preferForOf:
        'This find loop should be standardized by switching to a `for-of` loop.',
    },
    schema: {
      $defs: {
        preferOption: {
          enum: ['find', 'for-counter', 'for-of'],
        },
      },
      prefixItems: [
        {
          additionalProperties: false,
          properties: {
            prefer: {
              $ref: '#/$defs/preferOption',
              description: 'The preferred form for find loops.',
            },
          },
          type: 'object',
        },
      ],
    },
    type: 'problem',
  },
  defaultOptions: [{ prefer: 'find' }],
  create(context, [{ prefer }]) {
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
      ForOfStatement(node): void {
        if (prefer === 'for-of') {
          return;
        }

        const esNode = parserServices.esTreeNodeToTSNodeMap.get(node.right);
        const type = util.getConstrainedTypeAtLocation(checker, esNode);
        if (!util.isTypeArrayTypeOrUnionOfArrayTypes(type, checker)) {
          return;
        }

        const item = getLoopItem(node);
        if (!item) {
          return;
        }

        const bodyStatements = getBlockStatements(node.body);
        const ifStatement = bodyStatements[bodyStatements.length - 1];
        if (ifStatement?.type !== AST_NODE_TYPES.IfStatement) {
          return;
        }

        const consequentStatements = getBlockStatements(ifStatement.consequent);
        const returnStatement =
          consequentStatements[consequentStatements.length - 1];

        if (
          returnStatement?.type !== AST_NODE_TYPES.ReturnStatement ||
          returnStatement.argument?.type !== AST_NODE_TYPES.Identifier ||
          returnStatement.argument.name !== item.name
        ) {
          return;
        }

        const iterateeText = sourceCode.getText(node.right);
        const testText = sourceCode.getText(ifStatement.test);

        if (prefer === 'for-counter') {
          context.report({
            suggest: [
              {
                fix(fixer): TSESLint.RuleFix {
                  // Todo: find an unused name instead of always i
                  const i = `i`;

                  return fixer.replaceText(
                    node,
                    [
                      `for (let ${i} = 0; ${i} < ${iterateeText}.length; ${i} += 1) {`,
                      `  const ${item.name} = ${iterateeText}[${i}];`,
                      ...bodyStatements
                        .slice(0, bodyStatements.length - 1)
                        .map(
                          bodyStatement =>
                            `  ${sourceCode.getText(bodyStatement)}`,
                        ),
                      `  if (${testText}) {`,
                      ...consequentStatements
                        .slice(0, consequentStatements.length - 1)
                        .map(
                          statement => `    ${sourceCode.getText(statement)}`,
                        ),
                      `    return ${item.name};`,
                      `  }`,
                      `}`,
                    ].join('\n'),
                  );
                },
                messageId: 'suggestForCounter',
              },
            ],
            messageId: 'preferForCounter',
            node,
          });
        } else {
          context.report({
            suggest: [
              {
                fix(fixer): TSESLint.RuleFix {
                  // Todo: find an unused name instead of always result
                  const result = `result`;
                  return fixer.replaceText(
                    node,
                    [
                      `const ${result} = ${iterateeText}.find(${item.name} => {`,
                      ...bodyStatements
                        .slice(0, bodyStatements.length - 1)
                        .map(statement => `  ${sourceCode.getText(statement)}`),
                      ...(consequentStatements.length === 1
                        ? [`  return ${testText};`]
                        : [
                            `  if (${testText}) {`,
                            ...consequentStatements
                              .slice(0, consequentStatements.length - 1)
                              .map(
                                statement =>
                                  `    ${sourceCode.getText(statement)}`,
                              ),
                            `    return true;`,
                            `  }`,
                            ``,
                            `  return false;`,
                          ]),
                      `});`,
                      ``,
                      `if (result !== undefined) {`,
                      `  return result;`,
                      `}`,
                    ].join('\n'),
                  );
                },
                messageId: 'suggestFind',
              },
            ],
            messageId: 'preferFind',
            node,
          });
        }
      },
      // TODO: Support for (let i = 0; i < array.length i += 1) loops too
      ForStatement(node): void {
        if (prefer === 'for-counter') {
          return;
        }
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

function getBlockStatements(node: TSESTree.Statement): TSESTree.Statement[] {
  return node.type === AST_NODE_TYPES.BlockStatement ? node.body : [node];
}
