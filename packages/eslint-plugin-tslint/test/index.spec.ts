/**
 * @fileoverview TSLint wrapper plugin for ESLint
 * @author James Henry
 */

import { rules } from '../src/index';
import { RuleTester, Linter } from 'eslint';
import { readFileSync } from 'fs';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();

const parserOptions: Linter.ParserOptions = {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {},
};

/**
 * Inline rules should be supported
 */
const tslintRulesConfig = {
    rules: {
        semicolon: [true, 'always'],
    },
};

/**
 * Custom rules directories should be supported
 */
const tslintRulesDirectoryConfig = {
    rulesDirectory: ['./test/test-tslint-rules-directory'],
    rules: {
        'always-fail': {
            severity: 'error',
        },
    },
};

ruleTester.run('tslint/config', rules.config, {
    valid: [
        {
            code: 'var foo = true;',
            parser: 'typescript-eslint-parser',
            parserOptions,
            options: [tslintRulesConfig],
        },
        {
            filename: './test/test-project/file-spec.ts',
            code: readFileSync('./test/test-project/file-spec.ts', 'utf8'),
            parser: 'typescript-eslint-parser',
            parserOptions,
            options: [
                {
                    ...tslintRulesConfig,
                    configFile: `${__dirname}/test-project/tsconfig-files.json`,
                },
            ],
        },
    ],

    invalid: [
        {
            code: 'var foo = true',
            parser: 'typescript-eslint-parser',
            parserOptions,
            options: [tslintRulesConfig],
            output: 'var foo = true',
            errors: [
                {
                    message: 'Missing semicolon (tslint:semicolon)',
                    line: 1,
                    column: 15,
                },
            ],
        },
        {
            code: 'var foo = true',
            parser: 'typescript-eslint-parser',
            parserOptions,
            options: [tslintRulesDirectoryConfig],
            output: 'var foo = true',
            errors: [
                {
                    message: 'failure (tslint:always-fail)',
                    line: 1,
                    column: 1,
                },
            ],
        },
        {
            filename: './test/test-project/source.ts',
            code: readFileSync('./test/test-project/source.ts', 'utf8'),
            parser: 'typescript-eslint-parser',
            parserOptions,
            options: [
                {
                    rulesDirectory: ['node_modules/tslint/lib/rules'],
                    rules: { 'restrict-plus-operands': true },
                    configFile: `${__dirname}/test-project/tsconfig.json`,
                },
            ],
            errors: [
                {
                    message:
                        'Operands of \'+\' operation must either be both strings or both numbers, consider using template literals (tslint:restrict-plus-operands)',
                },
            ],
        },
    ],
});
