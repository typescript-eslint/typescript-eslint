/**
 * @fileoverview Prevent TypeScript-specific variables being falsely marked as unused
 * @author James Henry
 */
"use strict";

/**
 * Record that a particular variable has been used in code
 *
 * @param {Object} context The current rule context.
 * @param {String} name The name of the variable to mark as used.
 * @returns {Boolean} True if the variable was found and marked as used, false if not.
 */
function markVariableAsUsed(context, name) {
    var scope = context.getScope();
    var variables;
    var i;
    var len;
    var found = false;

    // Special Node.js scope means we need to start one level deeper
    if (scope.type === "global") {
        while (scope.childScopes.length) {
            scope = scope.childScopes[0];
        }
    }

    do {
        variables = scope.variables;
        for (i = 0, len = variables.length; i < len; i++) {
            if (variables[i].name === name) {
                variables[i].eslintUsed = true;
                found = true;
            }
        }
        scope = scope.upper;
    } while (scope);

    return found;
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Prevent TypeScript-specific variables being falsely marked as unused.",
            category: "TypeScript",
            recommended: true
        },
        schema: []
    },

    create: function(context) {

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Checks if the given node has any decorators and marks them as used.
         * @param {ASTNode} node The relevant AST node.
         * @returns {void}
         * @private
         */
        function markDecoratorsAsUsed(node) {
            if (!node.decorators || !node.decorators.length) {
                return;
            }
            node.decorators.forEach(function(decorator) {
                /**
                 * Decorator
                 */
                if (decorator.name) {
                    markVariableAsUsed(context, decorator.name);
                    return;
                }
                /**
                 * Decorator Factory
                 */
                if (decorator.callee && decorator.callee.name) {
                    markVariableAsUsed(context, decorator.callee.name);
                    return;
                }
            });
        }

        /**
         * Checks if the given node has any implemented interfaces and marks them as used.
         * @param {ASTNode} node The relevant AST node.
         * @returns {void}
         * @private
         */
        function markImplementedInterfacesAsUsed(node) {
            if (!node.implements || !node.implements.length) {
                return;
            }
            node.implements.forEach(function(implementedInterface) {
                if (!implementedInterface || !implementedInterface.id || !implementedInterface.id.name) {
                    return;
                }
                markVariableAsUsed(context, implementedInterface.id.name);
            });
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            ClassProperty: markDecoratorsAsUsed,
            ClassDeclaration: function(node) {
                markDecoratorsAsUsed(node);
                markImplementedInterfacesAsUsed(node);
            },
            MethodDefinition: function(node) {
                /**
                 * Decorators are only supported on class methods, so exit early
                 * if the parent is not a ClassBody
                 */
                const anc = context.getAncestors();
                const tAnc = anc.length;
                if (!tAnc || !anc[tAnc - 1] || anc[tAnc - 1].type !== "ClassBody") {
                    return;
                }
                /**
                 * Mark any of the method's own decorators as used
                 */
                markDecoratorsAsUsed(node);
                /**
                 * Mark any parameter decorators as used
                 */
                if (!node.value || !node.value.params || !node.value.params.length) {
                    return;
                }
                node.value.params.forEach(markDecoratorsAsUsed);
            },
        };

    }
};
