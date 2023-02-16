import type { ParseSettings } from '@typescript-eslint/typescript-estree/dist/parseSettings';

export const parseSettings: ParseSettings = {
  allowInvalidAST: false,
  code: '',
  codeFullText: '',
  comment: true,
  comments: [],
  debugLevel: new Set(),
  DEPRECATED__createDefaultProgram: false,
  errorOnTypeScriptSyntacticAndSemanticIssues: false,
  errorOnUnknownASTType: false,
  EXPERIMENTAL_useSourceOfProjectReferenceRedirect: false,
  extraFileExtensions: [],
  filePath: '',
  jsx: false,
  loc: true,
  // eslint-disable-next-line no-console
  log: console.log,
  moduleResolver: '',
  preserveNodeMaps: true,
  programs: null,
  projects: [],
  range: true,
  singleRun: false,
  tokens: [],
  tsconfigMatchCache: new Map(),
  tsconfigRootDir: '/',
};
