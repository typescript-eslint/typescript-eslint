/* eslint-disable @typescript-eslint/no-explicit-any, deprecation/deprecation -- wild and wacky testing */
import type * as ts from 'typescript';

import type { ParserServices, TSESLint, TSESTree } from '../../src';
import { ESLintUtils } from '../../src';

type UnknownRuleContext = Readonly<TSESLint.RuleContext<string, unknown[]>>;

const defaults = {
  parserPath: '@typescript-eslint/parser/dist/index.js',
  parserServices: {
    esTreeNodeToTSNodeMap: new Map<TSESTree.Node, ts.Node>(),
    program: {},
    tsNodeToESTreeNodeMap: new Map<ts.Node, TSESTree.Node>(),
  } as unknown as ParserServices,
};

const createMockRuleContext = (
  overrides: Partial<UnknownRuleContext> = {},
): UnknownRuleContext =>
  ({
    ...defaults,
    ...overrides,
  }) as unknown as UnknownRuleContext;

describe('getParserServices', () => {
  it('throws an error when given an unknown parser', () => {
    const context = createMockRuleContext({
      parserPath: 'unknown',
    });

    expect(() => ESLintUtils.getParserServices(context)).toThrow(
      new Error(
        `You have used a rule which requires @typescript-eslint/parser to generate type information. Unknown parser provided: '${context.parserPath}'.`,
      ),
    );
  });

  it('throws an error when parserOptions.esTreeNodeToTSNodeMap is missing', () => {
    const context = createMockRuleContext({
      parserServices: {
        ...defaults.parserServices,
        esTreeNodeToTSNodeMap: undefined as any,
      },
    });

    expect(() => ESLintUtils.getParserServices(context)).toThrow(
      new Error(
        'You have used a rule which requires parserServices to be generated. You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser.',
      ),
    );
  });

  it('throws an error when parserOptions.tsNodeToESTreeNodeMap is missing', () => {
    const context = createMockRuleContext({
      parserServices: {
        ...defaults.parserServices,
        tsNodeToESTreeNodeMap: undefined as any,
      },
    });

    expect(() => ESLintUtils.getParserServices(context)).toThrow(
      new Error(
        'You have used a rule which requires parserServices to be generated. You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser.',
      ),
    );
  });

  it('throws an error when parserServices.program is missing and allowWithoutFullTypeInformation is false', () => {
    const context = createMockRuleContext({
      parserServices: {
        ...defaults.parserServices,
        program: undefined as any,
      },
    });

    expect(() => ESLintUtils.getParserServices(context)).toThrow(
      new Error(
        'You have used a rule which requires parserServices to be generated. You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser.',
      ),
    );
  });

  it('returns when parserServices.program is missing and allowWithoutFullTypeInformation is true', () => {
    const context = createMockRuleContext({
      parserServices: {
        ...defaults.parserServices,
        program: undefined as any,
      },
    });

    expect(ESLintUtils.getParserServices(context, true)).toBe(
      context.parserServices,
    );
  });

  it('returns when parserServices is filled out', () => {
    const context = createMockRuleContext();

    expect(ESLintUtils.getParserServices(context)).toBe(context.parserServices);
  });
});
