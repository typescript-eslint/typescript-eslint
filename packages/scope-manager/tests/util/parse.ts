import * as tseslint from '@typescript-eslint/typescript-estree';
import { ParserOptions } from '@typescript-eslint/types';
import { analyze, AnalyzeOptions } from '../../src/analyze';

type SourceType = AnalyzeOptions['sourceType'];

const DEFAULT_PARSER_OPTIONS = {
  // the analyser requires ranges to work
  range: true,
};
const DEFAULT_ANALYZE_OPTIONS = {
  // include no libs so we don't pollute tests
  lib: [],
};

function parse(
  code: string,
  sourceTypeOrParserOptions:
    | SourceType
    | ParserOptions = DEFAULT_PARSER_OPTIONS,
): ReturnType<typeof tseslint.parse> {
  return tseslint.parse(code, {
    ...DEFAULT_PARSER_OPTIONS,
    ...(typeof sourceTypeOrParserOptions === 'string'
      ? {
          sourceType: sourceTypeOrParserOptions,
        }
      : sourceTypeOrParserOptions),
  });
}

interface ParseAndAnalyze {
  ast: ReturnType<typeof tseslint.parse>;
  scopeManager: ReturnType<typeof analyze>;
}
function parseAndAnalyze(code: string, sourceType: SourceType): ParseAndAnalyze;
function parseAndAnalyze(
  code: string,
  analyzeOptions?: AnalyzeOptions,
  parserOptions?: ParserOptions,
): ParseAndAnalyze;
function parseAndAnalyze(
  code: string,
  sourceTypeOrAnalyzeOption:
    | SourceType
    | AnalyzeOptions = DEFAULT_ANALYZE_OPTIONS,
  parserOptions: ParserOptions = DEFAULT_PARSER_OPTIONS,
): ParseAndAnalyze {
  const sourceType =
    typeof sourceTypeOrAnalyzeOption === 'string'
      ? sourceTypeOrAnalyzeOption
      : sourceTypeOrAnalyzeOption.sourceType;
  const ast = parse(code, { sourceType, ...parserOptions });

  const analyzeOptions = {
    ...DEFAULT_ANALYZE_OPTIONS,
    ...(typeof sourceTypeOrAnalyzeOption === 'string'
      ? { sourceType }
      : sourceTypeOrAnalyzeOption),
  };
  const scopeManager = analyze(ast, analyzeOptions);

  return { ast, scopeManager };
}

export { parse, parseAndAnalyze, AnalyzeOptions };
