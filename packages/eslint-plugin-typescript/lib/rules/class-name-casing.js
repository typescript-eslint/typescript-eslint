/**
 * @fileoverview Enforces PascalCased class and interface names.
 * @author Jed Fox
 */
"use strict";

const util = require("../util");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Require PascalCased class and interface names",
            extraDescription: [util.tslintRule("class-name")],
            category: "Best Practices",
            recommended: true,
            url:
                "https://github.com/nzakas/eslint-plugin-typescript/blob/master/docs/rules/class-name-casing.md"
        }
    },

    create(context) {
        // variables should be defined here

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Determine if the identifier name is PascalCased
         * @param   {string}  name The identifier name
         * @returns {boolean}      Is the name PascalCased?
         */
        function isPascalCase(name) {
            return /^[A-Z][0-9A-Za-z]*$/.test(name);
        }

        /**
         * Report a class declaration as invalid
         * @param   {Node} decl              The declaration
         * @param   {Node} [id=classDecl.id] The name of the declaration
         * @returns {undefined}
         */
        function report(decl, id) {
            id = id || decl.id;

            let friendlyName;

            switch (decl.type) {
                case "ClassDeclaration":
                case "ClassExpression":
                    friendlyName = "Class";
                    break;
                case "TSInterfaceDeclaration":
                    friendlyName = "Interface";
                    break;
                default:
                    friendlyName = decl.type;
            }

            context.report({
                node: id,
                message: `${friendlyName} '${id.name}' must be PascalCased`
            });
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {
            "ClassDeclaration, TSInterfaceDeclaration"(node) {
                // class expressions (i.e. export default class {}) are OK
                if (node.id && !isPascalCase(node.id.name)) {
                    report(node);
                }
            },
            VariableDeclarator(node) {
                if (node.init && node.init.type === "ClassExpression") {
                    const id = node.id;

                    if (node.init.id && !isPascalCase(node.init.id.name)) {
                        report(node.init);
                    } else if (id && !isPascalCase(id.name)) {
                        report(node.init, id);
                    }
                }
            }
        };
    }
};
