import type * as ts from 'typescript';

import type { ParserServices, TSESLint, TSESTree } from '../../src';
import type { FlatConfig } from '../../src/ts-eslint';

import { ESLintUtils } from '../../src';

type UnknownRuleContext = Readonly<TSESLint.RuleContext<string, unknown[]>>;

const defaults = {
  parserPath: '@typescript-eslint/parser/dist/index.js',
  sourceCode: {
    parserServices: {
      esTreeNodeToTSNodeMap: new Map<TSESTree.Node, ts.Node>(),
      program: {},
      tsNodeToESTreeNodeMap: new Map<ts.Node, TSESTree.Node>(),
    } as unknown as ParserServices,
  },
} as unknown as UnknownRuleContext;

const createMockRuleContext = (
  overrides: Partial<UnknownRuleContext> = {},
): UnknownRuleContext => ({
  ...defaults,
  ...overrides,
});

const requiresParserServicesMessageTemplate = (parser = '\\S*'): string =>
  'You have used a rule which requires type information, .+\n' +
  `Parser: ${parser}`;
const baseErrorRegex = (parser?: string): RegExp =>
  new RegExp(requiresParserServicesMessageTemplate(parser));
const unknownParserErrorRegex = (parser?: string): RegExp =>
  new RegExp(
    `${requiresParserServicesMessageTemplate(parser)}
Note: detected a parser other than @typescript-eslint/parser. Make sure the parser is configured to forward "parserOptions.project" to @typescript-eslint/parser.`,
  );

describe(ESLintUtils.getParserServices, () => {
  it('throws a standard error with the parser when parserOptions.esTreeNodeToTSNodeMap is missing and the parser is typescript-eslint', () => {
    const context = createMockRuleContext({
      sourceCode: {
        ...defaults.sourceCode,
        parserServices: {
          ...defaults.sourceCode.parserServices,
          esTreeNodeToTSNodeMap: undefined,
        },
      },
    });

    expect(() => ESLintUtils.getParserServices(context)).toThrow(
      baseErrorRegex('@typescript-eslint[\\/]parser[\\/]dist[\\/]index\\.js'),
    );
  });

  it('throws a standard error with the parser when parserOptions.esTreeNodeToTSNodeMap is missing and the parser is custom', () => {
    const context = createMockRuleContext({
      languageOptions: {
        parser: {
          meta: {
            name: 'custom-parser',
          },
        } as FlatConfig.Parser,
      },
      parserPath: undefined,
      sourceCode: {
        ...defaults.sourceCode,
        parserServices: {
          ...defaults.sourceCode.parserServices,
          esTreeNodeToTSNodeMap: undefined,
        },
      },
    });

    expect(() => ESLintUtils.getParserServices(context)).toThrow(
      baseErrorRegex('custom-parser'),
    );
  });

  it('throws a standard error with an unknown parser when parserOptions.esTreeNodeToTSNodeMap is missing and the parser is missing', () => {
    const context = createMockRuleContext({
      languageOptions: {},
      parserPath: undefined,
      sourceCode: {
        ...defaults.sourceCode,
        parserServices: {
          ...defaults.sourceCode.parserServices,
          esTreeNodeToTSNodeMap: undefined,
        },
      },
    });

    expect(() => ESLintUtils.getParserServices(context)).toThrow(
      baseErrorRegex('\\(unknown\\)'),
    );
  });

  it('throws a standard error with an unknown parser when parserOptions.esTreeNodeToTSNodeMap is missing and the parser is unknown', () => {
    const context = createMockRuleContext({
      languageOptions: {
        parser: {} as FlatConfig.Parser,
      },
      parserPath: undefined,
      sourceCode: {
        ...defaults.sourceCode,
        parserServices: {
          ...defaults.sourceCode.parserServices,
          esTreeNodeToTSNodeMap: undefined,
        },
      },
    });

    expect(() => ESLintUtils.getParserServices(context)).toThrow(
      baseErrorRegex('\\(unknown\\)'),
    );
  });

  it('throws an augment error when parserOptions.esTreeNodeToTSNodeMap is missing and the parser is unknown', () => {
    const context = createMockRuleContext({
      parserPath: '@babel/parser.js',
      sourceCode: {
        ...defaults.sourceCode,
        parserServices: {
          ...defaults.sourceCode.parserServices,
          esTreeNodeToTSNodeMap: undefined,
        },
      },
    });
    expect(() => ESLintUtils.getParserServices(context)).toThrow(
      unknownParserErrorRegex(),
    );
  });

  it('throws an error when parserOptions.tsNodeToESTreeNodeMap is missing', () => {
    const context = createMockRuleContext({
      sourceCode: {
        ...defaults.sourceCode,
        parserServices: {
          ...defaults.sourceCode.parserServices,
          tsNodeToESTreeNodeMap: undefined,
        },
      },
    });

    expect(() => ESLintUtils.getParserServices(context)).toThrow(
      baseErrorRegex(),
    );
  });

  it('throws an error when parserServices.program is missing and allowWithoutFullTypeInformation is false', () => {
    const context = createMockRuleContext({
      sourceCode: {
        ...defaults.sourceCode,
        parserServices: {
          ...defaults.sourceCode.parserServices,
          program: undefined,
        },
      },
    });

    expect(() => ESLintUtils.getParserServices(context)).toThrow(
      baseErrorRegex(),
    );
  });

  it('returns when parserServices.program is missing and allowWithoutFullTypeInformation is true', () => {
    const context = createMockRuleContext({
      sourceCode: {
        ...defaults.sourceCode,
        parserServices: {
          ...defaults.sourceCode.parserServices,
          program: undefined,
        },
      },
    });

    expect(ESLintUtils.getParserServices(context, true)).toBe(
      context.sourceCode.parserServices,
    );
  });

  it('returns when parserServices is filled out', () => {
    const context = createMockRuleContext();

    expect(ESLintUtils.getParserServices(context)).toBe(
      context.sourceCode.parserServices,
    );
  });
});
