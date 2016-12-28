/**
 * @fileoverview TSLint wrapper plugin for ESLint
 * @author James Henry
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import { Linter as TSLintLinter } from "tslint"

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

export const rules = {
    /**
     * Expose a single rule called "config", which will be accessed in users' eslint config files
     * via "tslint/config"
     */
    "config": {
        meta: {
            docs: {
                description: "Wraps a TSLint configuration and lints the whole source using TSLint",
                category: "TSLint"
            },
            fixable: false,
            schema: [
                {
                    type: "object",
                    properties: {
                        rules: {
                            type: "object",
                             /**
                             * No fixed schema properties for rules, as this would be a permanently moving target
                             */
                            additionalProperties: true
                        },
                        rulesDirectory: {
                            type: "array",
                            items: {
                                type: "string"
                            }
                        }
                    },
                    additionalProperties: false
                }
            ]
        },
        create: function(context: any) {

            const fakeFilename = 'x.ts'
            const sourceCode: string = context.getSourceCode().text

            /**
             * The TSLint rules configuration passed in by the user
             */
            const { rules: tslintRules, rulesDirectory: tslintRulesDirectory } = context.options[0]

            const tslintOptions = {
                formatter: "json",
                fix: false,
                rulesDirectory: tslintRulesDirectory,
            }

            /**
             * Create an instance of TSLint
             */
            const tslint = new TSLintLinter(tslintOptions)

            /**
             * Lint the source code using the configured TSLint instance, and the rules which have been
             * passed via the ESLint rule options for this rule (using "tslint/config")
             */
            tslint.lint(fakeFilename, sourceCode, {
                rules: tslintRules,
            })

            const result = tslint.getResult()

            /**
             * Format the TSLint results for ESLint
             */
            if (result.failures && result.failures.length) {
                result.failures.forEach((failure) => {
                    const start = failure.getStartPosition().getLineAndCharacter()
                    const end = failure.getEndPosition().getLineAndCharacter()
                    context.report({
                        message: failure.getFailure(),
                        loc: {
                            start: {
                                line: start.line + 1,
                                column: start.character,
                            },
                            end: {
                                line: end.line + 1,
                                column: end.character,
                            },
                        },
                    })
                })
            }

            /**
             * Return an empty object for the ESLint rule
             */
            return {}

        },
    },
}
