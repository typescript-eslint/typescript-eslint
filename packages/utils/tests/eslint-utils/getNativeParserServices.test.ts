import type * as ts from 'typescript';

import type {
  NativeParserServices,
  ParserServices,
  TSESLint,
  TSESTree,
} from '../../src';
import type { FlatConfig } from '../../src/ts-eslint';

import { ESLintUtils } from '../../src';

type UnknownRuleContext = Readonly<TSESLint.RuleContext<string, unknown[]>>;

const nativeServices = {
  backend: 'native',
  esTreeNodeToTSNodeMap: new Map<TSESTree.Node, ts.Node>(),
  tsNodeToESTreeNodeMap: new Map<ts.Node, TSESTree.Node>(),
} as unknown as NativeParserServices;
const classicServices = {
  backend: 'typescript',
  esTreeNodeToTSNodeMap: new Map<TSESTree.Node, ts.Node>(),
  program: {},
  tsNodeToESTreeNodeMap: new Map<ts.Node, TSESTree.Node>(),
} as unknown as ParserServices;

const createContext = (
  parserServices: ParserServices,
  overrides: Partial<UnknownRuleContext> = {},
): UnknownRuleContext =>
  ({
    parserPath: '@typescript-eslint/parser/dist/index.js',
    sourceCode: { parserServices },
    ...overrides,
  }) as UnknownRuleContext;

const nativeContext = createContext(nativeServices);
const classicContext = createContext(classicServices);

expectTypeOf(
  ESLintUtils.getNativeParserServices(nativeContext),
).toEqualTypeOf<NativeParserServices>();

describe(ESLintUtils.getNativeParserServices, () => {
  it('returns native parser services', () => {
    expect(ESLintUtils.getNativeParserServices(nativeContext)).toBe(
      nativeServices,
    );
  });

  it('rejects classic parser services', () => {
    expect(() => ESLintUtils.getNativeParserServices(classicContext)).toThrow(
      'This rule requires experimental native parser services.',
    );
  });

  it('validates both node maps', () => {
    for (const missingMap of [
      'esTreeNodeToTSNodeMap',
      'tsNodeToESTreeNodeMap',
    ] as const) {
      expect(() =>
        ESLintUtils.getNativeParserServices(
          createContext({
            ...nativeServices,
            [missingMap]: undefined,
          }),
        ),
      ).toThrow('You have used a rule which requires type information');
    }
  });

  it('includes useful diagnostics for another parser', () => {
    expect(() =>
      ESLintUtils.getNativeParserServices(
        createContext({} as ParserServices, {
          languageOptions: {
            parser: { meta: { name: 'other-parser' } } as FlatConfig.Parser,
            parserOptions: {},
          },
          parserPath: undefined,
        }),
      ),
    ).toThrow(/Parser: other-parser[\s\S]+detected a parser other than/);
  });
});
