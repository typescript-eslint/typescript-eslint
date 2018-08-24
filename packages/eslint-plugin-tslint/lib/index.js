"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslint_1 = require("tslint");
var typescript_service_1 = require("typescript-service");
var languageService;
exports.rules = {
    config: {
        meta: {
            docs: {
                description: 'Wraps a TSLint configuration and lints the whole source using TSLint',
                category: 'TSLint',
            },
            fixable: false,
            schema: [
                {
                    type: 'object',
                    properties: {
                        rules: {
                            type: 'object',
                            additionalProperties: true,
                        },
                        rulesDirectory: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                        },
                        configFile: {
                            type: 'string',
                        },
                        compilerOptions: {
                            type: 'object',
                            additionalProperties: true,
                        },
                    },
                    additionalProperties: false,
                },
            ],
        },
        create: function (context) {
            var fileName = context.getFilename();
            var sourceCode = context.getSourceCode().text;
            var _a = context.options[0], tslintRules = _a.rules, tslintRulesDirectory = _a.rulesDirectory, configFile = _a.configFile, compilerOptions = _a.compilerOptions;
            var tslintOptions = {
                formatter: 'json',
                fix: false,
                rulesDirectory: tslintRulesDirectory,
            };
            var rawConfig = {};
            rawConfig.rules = tslintRules || {};
            rawConfig.rulesDirectory = tslintRulesDirectory || [];
            var tslintConfig = tslint_1.Configuration.parseConfigFile(rawConfig);
            var program = undefined;
            if (fileName !== '<input>' && configFile) {
                if (!languageService) {
                    languageService = typescript_service_1.createService({ configFile: configFile, compilerOptions: compilerOptions });
                }
                program = languageService.getProgram();
            }
            var tslint = new tslint_1.Linter(tslintOptions, program);
            tslint.lint(fileName, sourceCode, tslintConfig);
            var result = tslint.getResult();
            if (result.failures && result.failures.length) {
                result.failures.forEach(function (failure) {
                    var start = failure.getStartPosition().getLineAndCharacter();
                    var end = failure.getEndPosition().getLineAndCharacter();
                    context.report({
                        message: failure.getFailure() + " (tslint:" + failure.getRuleName() + ")",
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
