"use strict";
var tslint_1 = require("tslint");
exports.rules = {
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
        create: function (context) {
            var fakeFilename = 'x.ts';
            var sourceCode = context.getSourceCode().text;
            var _a = context.options[0], tslintRules = _a.rules, tslintRulesDirectory = _a.rulesDirectory;
            var tslintOptions = {
                formatter: "json",
                fix: false,
                rulesDirectory: tslintRulesDirectory,
            };
            var tslint = new tslint_1.Linter(tslintOptions);
            tslint.lint(fakeFilename, sourceCode, {
                rules: tslintRules,
            });
            var result = tslint.getResult();
            if (result.failures && result.failures.length) {
                result.failures.forEach(function (failure) {
                    var start = failure.getStartPosition().getLineAndCharacter();
                    var end = failure.getEndPosition().getLineAndCharacter();
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
                    });
                });
            }
            return {};
        },
    },
};
