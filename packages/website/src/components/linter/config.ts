import type { ParseSettings } from '@typescript-eslint/typescript-estree/use-at-your-own-risk';
import type { ClassicConfig } from '@typescript-eslint/utils/ts-eslint';

export const PARSER_NAME = '@typescript-eslint/parser';

export const defaultParseSettings: ParseSettings = {
  allowInvalidAST: false,
  code: '',
  codeFullText: '',
  comment: true,
  comments: [],
  debugLevel: new Set(),
  errorOnTypeScriptSyntacticAndSemanticIssues: false,
  errorOnUnknownASTType: false,
  EXPERIMENTAL_useSourceOfProjectReferenceRedirect: false,
  extraFileExtensions: [],
  filePath: '',
  // JSDocParsingMode was added in TS 5.3.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  jsDocParsingMode: window.ts?.JSDocParsingMode?.ParseAll,
  jsx: true,
  loc: true,
  log: console.log,
  preserveNodeMaps: true,
  programs: null,
  projects: new Map(),
  projectService: undefined,
  range: true,
  singleRun: false,
  suppressDeprecatedPropertyWarnings: false,
  tokens: [],
  tsconfigMatchCache: new Map(),
  tsconfigRootDir: '/',
};

export const defaultEslintConfig: ClassicConfig.Config = {
  parser: PARSER_NAME,
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
      globalReturn: false,
    },
    ecmaVersion: 'latest',
    project: ['./tsconfig.json'],
    sourceType: 'module',
  },
  rules: {},
};
