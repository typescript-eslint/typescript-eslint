/**
 * @fileoverview Enforces a member delimiter style in interfaces and type literals.
 * @author Patricio Trevino
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const definition = {
    type: "object",
    properties: {
        delimiter: { enum: ["none", "semi", "comma"] },
        requireLast: { type: "boolean" },
        ignoreSingleLine: { type: "boolean" }
    },
    additionalProperties: false
};

module.exports = {
    meta: {
        docs: {
            description:
                "Require a specific member delimiter style for interfaces and type literals",
            category: "TypeScript",
            url:
                "https://github.com/nzakas/eslint-plugin-typescript/blob/master/docs/rules/member-delimiter-style.md"
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    delimiter: { enum: ["none", "semi", "comma"] },
                    requireLast: { type: "boolean" },
                    ignoreSingleLine: { type: "boolean" },
                    overrides: {
                        type: "object",
                        properties: {
                            interface: definition,
                            typeLiteral: definition
                        },
                        additionalProperties: false
                    }
                },
                additionalProperties: false
            }
        ]
    },

    create(context) {
        const sourceCode = context.getSourceCode();
        const options = context.options[0] || {};

        const overrides = options.overrides || {};
        const defaults = {
            delimiter: "semi",
            requireLast: true,
            ignoreSingleLine: true
        };

        const interfaceOptions = Object.assign(
            {},
            defaults,
            options,
            overrides.interface
        );
        const typeLiteralOptions = Object.assign(
            {},
            defaults,
            options,
            overrides.typeLiteral
        );

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Check the last token in the given member.
         * @param {ASTNode} member the member to be evaluated.
         * @param {Object} opts the options to be validated.
         * @param {boolean} isLast a flag indicating `member` is the last in the
         *                         interface or type literal.
         * @param {boolean} isSameLine a flag indicating the interface or type
         *                             literal was declared in a single line.
         * @returns {void}
         * @private
         */
        function checkLastToken(member, opts, isLast, isSameLine) {
            let message;
            let missingDelimiter = false;
            const lastToken = sourceCode.getLastToken(member, {
                includeComments: false
            });

            if (lastToken.value === ";" && opts.delimiter !== "semi") {
                message =
                    opts.delimiter === "comma"
                        ? "Expected a comma."
                        : "Unexpected separator (;).";
            } else if (lastToken.value === "," && opts.delimiter !== "comma") {
                message =
                    opts.delimiter === "semi"
                        ? "Expected a semicolon."
                        : "Unexpected separator (,).";
            } else if (
                lastToken.value !== ";" &&
                lastToken.value !== "," &&
                opts.delimiter !== "none"
            ) {
                let canOmit = isLast;

                if (canOmit) {
                    canOmit =
                        !opts.requireLast ||
                        (isSameLine && opts.ignoreSingleLine);
                }

                if (!canOmit) {
                    missingDelimiter = true;
                    message =
                        opts.delimiter === "semi"
                            ? "Expected a semicolon."
                            : "Expected a comma.";
                }
            }

            if (message) {
                context.report({
                    node: lastToken,
                    loc: {
                        start: {
                            line: lastToken.loc.end.line,
                            column: lastToken.loc.end.column
                        },
                        end: {
                            line: lastToken.loc.end.line,
                            column: lastToken.loc.end.column
                        }
                    },
                    message,
                    fix(fixer) {
                        let token;

                        if (opts.delimiter === "semi") {
                            token = ";";
                        } else if (opts.delimiter === "comma") {
                            token = ",";
                        } else {
                            // remove the unneeded token
                            return fixer.remove(lastToken);
                        }

                        if (missingDelimiter) {
                            // add the missing delimiter
                            return fixer.insertTextAfter(lastToken, token);
                        } else if (isLast && !opts.requireLast) {
                            return fixer.remove(lastToken);
                        }

                        // correct the current delimiter
                        return fixer.replaceText(lastToken, token);
                    }
                });
            }
        }

        /**
         * Check the member separator being used matches the delimiter.
         * @param {ASTNode} node the node to be evaluated.
         * @returns {void}
         * @private
         */
        function checkMemberSeparatorStyle(node) {
            const isSingleLine = node.loc.start.line === node.loc.end.line;
            const isInterface = node.type === "TSInterfaceBody";
            const members = isInterface ? node.body : node.members;

            members.forEach((member, index) => {
                checkLastToken(
                    member,
                    isInterface ? interfaceOptions : typeLiteralOptions,
                    index === members.length - 1,
                    isSingleLine
                );
            });
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {
            TSInterfaceBody: checkMemberSeparatorStyle,
            TSTypeLiteral: checkMemberSeparatorStyle
        };
    }
};
