/**
 * @fileoverview Prefer an interface declaration over a type literal (type T = { ... })
 * @author Armano <https://github.com/armano2>
 */
"use strict";

const util = require("../util");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description:
                "Prefer an interface declaration over a type literal (type T = { ... })",
            extraDescription: [util.tslintRule("interface-over-type-literal")],
            category: "TypeScript",
            url: util.metaDocsUrl("prefer-interface"),
        },
        fixable: "code",
        messages: {
            interfaceOverType: "Use an interface instead of a type literal.",
        },
        schema: [],
    },
    create(context) {
        const sourceCode = context.getSourceCode();

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            // VariableDeclaration with kind type has only one VariableDeclarator
            "VariableDeclaration[kind='type'] > VariableDeclarator[init.type='TSTypeLiteral']"(
                node
            ) {
                context.report({
                    node,
                    messageId: "interfaceOverType",
                    fix(fixer) {
                        const typeNode = node.typeParameters || node.id;

                        const fixes = [
                            fixer.replaceText(
                                sourceCode.getFirstToken(node.parent),
                                "interface"
                            ),
                            fixer.replaceTextRange(
                                [typeNode.range[1], node.init.range[0]],
                                " "
                            ),
                        ];

                        const afterToken = sourceCode.getTokenAfter(node.init);

                        if (
                            afterToken &&
                            afterToken.type === "Punctuator" &&
                            afterToken.value === ";"
                        ) {
                            fixes.push(fixer.remove(afterToken));
                        }

                        return fixes;
                    },
                });
            },
        };
    },
};
