import type { ParseSettings } from '@typescript-eslint/typescript-estree/dist/parseSettings';

export const parseSettings: ParseSettings = {
  code: '',
  codeFullText: '',
  comment: true,
  comments: [],
  DEPRECATED__createDefaultProgram: false,
  debugLevel: new Set(),

  extraFileExtensions: [],
  filePath: '',
  jsx: false,
  loc: true,
  // eslint-disable-next-line no-console
  log: console.log,
  preserveNodeMaps: true,
  projects: [],
  range: true,
  tokens: [],
  tsconfigRootDir: '/',
  errorOnInvalidAST: false,
  errorOnUnknownASTType: false,
  tsconfigMatchCache: new Map(),
  errorOnTypeScriptSyntacticAndSemanticIssues: false,
  EXPERIMENTAL_useSourceOfProjectReferenceRedirect: false,
  singleRun: false,
  programs: null,
  moduleResolver: '',
};
