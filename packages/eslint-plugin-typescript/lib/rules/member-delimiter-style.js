/**
 * @fileoverview Enforces a member delimiter style in interfaces and type literals.
 * @author Patricio Trevino
 * @author Brad Zacher
 */
"use strict";

const { deepMerge, metaDocsUrl, applyDefault } = require("../util");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const defaultOptions = [
    {
        multiline: {
            delimiter: "semi",
            requireLast: true,
        },
        singleline: {
            delimiter: "semi",
            requireLast: false,
        },
    },
];

const definition = {
    type: "object",
    properties: {
        multiline: {
            type: "object",
            properties: {
                delimiter: { enum: ["none", "semi", "comma"] },
                requireLast: { type: "boolean" },
            },
            additionalProperties: false,
        },
        singleline: {
            type: "object",
            properties: {
                // note can't have "none" for single line delimiter as it's invlaid syntax
                delimiter: { enum: ["semi", "comma"] },
                requireLast: { type: "boolean" },
            },
            additionalProperties: false,
        },
    },
    additionalProperties: false,
};

module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description:
                "Require a specific member delimiter style for interfaces and type literals",
            category: "TypeScript",
            url: metaDocsUrl("member-delimiter-style"),
            recommended: "error",
        },
        fixable: "code",
        messages: {
            unexpectedComma: "Unexpected separator (,).",
            unexpectedSemi: "Unexpected separator (;).",
            expectedComma: "Expected a comma.",
            expectedSemi: "Expected a semicolon.",
        },
        schema: [
            {
                type: "object",
                properties: Object.assign({}, definition.properties, {
                    overrides: {
                        type: "object",
                        properties: {
                            interface: definition,
                            typeLiteral: definition,
                        },
                        additionalProperties: false,
                    },
                }),
                additionalProperties: false,
            },
        ],
    },

    create(context) {
        const sourceCode = context.getSourceCode();
        const options = applyDefault(defaultOptions, context.options)[0];

        // use the base options as the defaults for the cases
        const baseOptions = options;
        const overrides = baseOptions.overrides || {};
        const interfaceOptions = deepMerge(baseOptions, overrides.interface);
        const typeLiteralOptions = deepMerge(
            baseOptions,
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
         * @returns {void}
         * @private
         */
        function checkLastToken(member, opts, isLast) {
            /**
             * Resolves the boolean value for the given setting enum value
             * @param {"semi" | "comma" | "none"} type the option name
             * @returns {boolean} the resolved value
             */
            function getOption(type) {
                if (isLast && !opts.requireLast) {
                    // only turn the option on if its expecting no delimiter for the last member
                    return type === "none";
                }
                return opts.delimiter === type;
            }

            let messageId;
            let missingDelimiter = false;
            const lastToken = sourceCode.getLastToken(member, {
                includeComments: false,
            });

            const optsSemi = getOption("semi");
            const optsComma = getOption("comma");
            const optsNone = getOption("none");

            if (lastToken.value === ";") {
                if (optsComma) {
                    messageId = "expectedComma";
                } else if (optsNone) {
                    missingDelimiter = true;
                    messageId = "unexpectedSemi";
                }
            } else if (lastToken.value === ",") {
                if (optsSemi) {
                    messageId = "expectedSemi";
                } else if (optsNone) {
                    missingDelimiter = true;
                    messageId = "unexpectedComma";
                }
            } else {
                if (optsSemi) {
                    missingDelimiter = true;
                    messageId = "expectedSemi";
                } else if (optsComma) {
                    missingDelimiter = true;
                    messageId = "expectedComma";
                }
            }

            if (messageId) {
                context.report({
                    node: lastToken,
                    loc: {
                        start: {
                            line: lastToken.loc.end.line,
                            column: lastToken.loc.end.column,
                        },
                        end: {
                            line: lastToken.loc.end.line,
                            column: lastToken.loc.end.column,
                        },
                    },
                    messageId,
                    fix(fixer) {
                        if (optsNone) {
                            // remove the unneeded token
                            return fixer.remove(lastToken);
                        }

                        const token = optsSemi ? ";" : ",";

                        if (missingDelimiter) {
                            // add the missing delimiter
                            return fixer.insertTextAfter(lastToken, token);
                        }

                        // correct the current delimiter
                        return fixer.replaceText(lastToken, token);
                    },
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
            const isInterface = node.type === "TSInterfaceBody";
            const isSingleLine = node.loc.start.line === node.loc.end.line;

            const members = isInterface ? node.body : node.members;

            const typeOpts = isInterface
                ? interfaceOptions
                : typeLiteralOptions;
            const opts = isSingleLine
                ? typeOpts.singleline
                : typeOpts.multiline;

            members.forEach((member, index) => {
                checkLastToken(member, opts, index === members.length - 1);
            });
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {
            TSInterfaceBody: checkMemberSeparatorStyle,
            TSTypeLiteral: checkMemberSeparatorStyle,
        };
    },
};
