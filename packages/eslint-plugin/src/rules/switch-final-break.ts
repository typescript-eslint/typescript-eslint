import * as util from "../util";
import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/experimental-utils";

type MessageIds = "switchFinalBreakNever" | "switchFinalBreakAlways";

type Options = ["never" | "always"];


export default util.createRule<Options, MessageIds>({
  name: "switch-final-break",
  meta: {
    docs: {
      description:
        "Checks whether the final clause of a switch statement ends in `break;`.",
      category: "Best Practices",
      recommended: false,
    },
    fixable: "code",
    messages: {
      switchFinalBreakNever:
        "Final clause in 'switch' statement should not end with 'break;'.",
      switchFinalBreakAlways:
        "Final clause in 'switch' statement should end with 'break;'.",
    },
    schema: [
      {
        enum: ["never", "always"],
      },
    ],
    type: "suggestion",
  },
  defaultOptions: ["never"],
  create(context, [requireBreak]) {
    function getLastStatement(node: TSESTree.SwitchCase) {
      if (node.consequent.length === 1 && node.consequent[0].type === AST_NODE_TYPES.BlockStatement) {
        //block statement
        const block = node.consequent[0] as TSESTree.BlockStatement;
        return block.body[block.body.length - 1];
      } else {
        return node.consequent[node.consequent.length - 1];
      }
    }

    return {
      SwitchStatement: function(node) {
        if (node.cases.length !== 0) {
          const lastCase = node.cases[node.cases.length - 1];
          const lastStatement = getLastStatement(lastCase);

          if (requireBreak === "always") {
            if (!lastStatement || lastStatement.type !== AST_NODE_TYPES.BreakStatement) {
              context.report({
                node: lastCase,
                messageId: "switchFinalBreakAlways",
                fix: fixer => {
                  if (!lastStatement) {
                    return fixer.insertTextAfter(lastCase, " break;");
                  }
                  const lastStatementText = context.getSourceCode().getLines()[lastStatement.loc.start.line - 1];
                  const indentation = lastStatementText.slice(0, lastStatementText.search(/\S+/));
                  return fixer.insertTextAfter(lastStatement, `\n${indentation}break;`);
                },
              });
            }

            return;
          }

          if (lastStatement === undefined || (lastStatement.type !== AST_NODE_TYPES.BreakStatement)) {
            return;
          }

          if (lastStatement.label !== null) {
            const parent = node.parent;
            if (parent && (!(parent.type === AST_NODE_TYPES.LabeledStatement) || ((parent as unknown as TSESTree.LabeledStatement).label === lastStatement.label))) {
              // break jumps somewhere else, don't complain
              return;
            }
          }

          context.report({
            node: lastStatement,
            messageId: "switchFinalBreakNever",
            fix: fixer => {
              const sourceText = context.getSourceCode().getText();
              const reversedSourceText = sourceText.split("").reverse().join("");
              const lastStatementReversedIndex = reversedSourceText.length - lastStatement.range[0];
              const substringToTrimMatch = reversedSourceText.slice(lastStatementReversedIndex).match(/\s*\n?/g);
              const trimLength = substringToTrimMatch ? substringToTrimMatch[0].length : 0;
              return fixer.removeRange([lastStatement.range[0] - trimLength, lastStatement.range[1]]);
            },
          });
        }
      },
    };
  },
});
