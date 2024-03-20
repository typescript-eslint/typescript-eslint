/* eslint-disable @typescript-eslint/no-explicit-any -- wild and wacky testing */
import type * as ts from 'typescript';

import type { ParserServices, TSESLint, TSESTree } from '../../src';
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
): UnknownRuleContext =>
  ({
    ...defaults,
    ...overrides,
  }) as unknown as UnknownRuleContext;

const requiresParserServicesMessageTemplate =
  'You have used a rule which requires parserServices to be generated. You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser.\n' +
  'Parser: \\S*';
const baseErrorRegex = new RegExp(requiresParserServicesMessageTemplate);
const unknownParserErrorRegex = new RegExp(
  requiresParserServicesMessageTemplate +
    '\n' +
    'Note: detected a parser other than @typescript-eslint/parser. Make sure the parser is configured to forward "parserOptions.project" to @typescript-eslint/parser.',
);

describe('getParserServices', () => {
  it('throws a standard error when parserOptions.esTreeNodeToTSNodeMap is missing and the parser is known', () => {
    const context = createMockRuleContext({
      sourceCode: {
        ...defaults.sourceCode,
        parserServices: {
          ...defaults.sourceCode.parserServices,
          esTreeNodeToTSNodeMap: undefined as any,
        },
      },
    });

    expect(() => ESLintUtils.getParserServices(context)).toThrow(
      baseErrorRegex,
    );
  });

  it('throws an augment error when parserOptions.esTreeNodeToTSNodeMap is missing and the parser is unknown', () => {
    const context = createMockRuleContext({
      parserPath: '@babel/parser.js',
      sourceCode: {
        ...defaults.sourceCode,
        parserServices: {
          ...defaults.sourceCode.parserServices,
          esTreeNodeToTSNodeMap: undefined as any,
        },
      },
    });
    expect(() => ESLintUtils.getParserServices(context)).toThrow(
      unknownParserErrorRegex,
    );
  });

  it('throws an error when parserOptions.tsNodeToESTreeNodeMap is missing', () => {
    const context = createMockRuleContext({
      sourceCode: {
        ...defaults.sourceCode,
        parserServices: {
          ...defaults.sourceCode.parserServices,
          tsNodeToESTreeNodeMap: undefined as any,
        },
      },
    });

    expect(() => ESLintUtils.getParserServices(context)).toThrow(
      baseErrorRegex,
    );
  });

  it('throws an error when parserServices.program is missing and allowWithoutFullTypeInformation is false', () => {
    const context = createMockRuleContext({
      sourceCode: {
        ...defaults.sourceCode,
        parserServices: {
          ...defaults.sourceCode.parserServices,
          program: undefined as any,
        },
      },
    });

    expect(() => ESLintUtils.getParserServices(context)).toThrow(
      baseErrorRegex,
    );
  });

  it('returns when parserServices.program is missing and allowWithoutFullTypeInformation is true', () => {
    const context = createMockRuleContext({
      sourceCode: {
        ...defaults.sourceCode,
        parserServices: {
          ...defaults.sourceCode.parserServices,
          program: undefined as any,
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
