/**
 * @fileoverview Enforces member overloads to be consecutive.
 * @author Patricio Trevino
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Require that member overloads be consecutive",
            category: "TypeScript",
            url:
                "https://github.com/nzakas/eslint-plugin-typescript/blob/master/docs/rules/adjacent-overload-signatures.md"
        },
        schema: []
    },

    create(context) {
        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Gets the name of the member being processed.
         * @param {ASTNode} member the member being processed.
         * @returns {string} the name of the member or null if it's a member not relevant to the rule.
         * @private
         */
        function getMemberName(member) {
            if (!member) return null;

            switch (member.type) {
                case "ExportDefaultDeclaration":
                case "ExportNamedDeclaration": {
                    // export statements (e.g. export { a };)
                    // have no declarations, so ignore them
                    return member.declaration
                        ? getMemberName(member.declaration)
                        : null;
                }
                case "DeclareFunction":
                case "FunctionDeclaration":
                case "TSNamespaceFunctionDeclaration":
                case "TSEmptyBodyFunctionDeclaration":
                case "TSEmptyBodyDeclareFunction": {
                    return member.id && member.id.name;
                }
                case "TSMethodSignature": {
                    return (
                        (member.key && (member.key.name || member.key.value)) ||
                        (member.name && (member.name.name || member.name.value))
                    );
                }
                case "TSCallSignature": {
                    return "call";
                }
                case "TSConstructSignature": {
                    return "new";
                }
                case "MethodDefinition": {
                    return member.key.name || member.key.value;
                }
                default: {
                    return null;
                }
            }
        }

        /**
         * Check the body for overload methods.
         * @param {ASTNode} node the body to be inspected.
         * @returns {void}
         * @private
         */
        function checkBodyForOverloadMethods(node) {
            const members = node.body || node.members;

            if (members) {
                let name;
                let index;
                let lastName;
                const seen = [];

                members.forEach(member => {
                    name = getMemberName(member);

                    index = seen.indexOf(name);
                    if (index > -1 && lastName !== name) {
                        context.report({
                            node: member,
                            message: `All '${name}' signatures should be adjacent`
                        });
                    } else if (name && index === -1) {
                        seen.push(name);
                    }

                    lastName = name;
                });
            }
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            TSModuleBlock: checkBodyForOverloadMethods,
            TSTypeLiteral: checkBodyForOverloadMethods,
            TSInterfaceBody: checkBodyForOverloadMethods,
            ClassBody: checkBodyForOverloadMethods,
            Program: checkBodyForOverloadMethods
        };
    }
};
