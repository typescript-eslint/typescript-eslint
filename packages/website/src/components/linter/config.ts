import type { ParseSettings } from '@typescript-eslint/typescript-estree/use-at-your-own-risk';
import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

export const defaultParseSettings: ParseSettings = {
  allowInvalidAST: false,
  code: '',
  codeFullText: '',
  comment: true,
  comments: [],
  debugLevel: new Set(),
  errorOnTypeScriptSyntacticAndSemanticIssues: false,
  errorOnUnknownASTType: false,
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

export const defaultEslintLanguageConfig: FlatConfig.LanguageOptions = {
  parserOptions: {
    ecmaFeatures: {
      globalReturn: false,
      jsx: true,
    },
    ecmaVersion: 'latest',
    project: ['./tsconfig.json'],
    sourceType: 'module',
  },
};
