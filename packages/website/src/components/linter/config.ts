import type { Extra } from '@typescript-eslint/typescript-estree/dist/parser-options';

export const extra: Extra = {
  code: '',
  comment: true,
  comments: [],
  createDefaultProgram: false,
  debugLevel: new Set(),
  errorOnTypeScriptSyntacticAndSemanticIssues: false,
  errorOnUnknownASTType: false,
  extraFileExtensions: [],
  filePath: '',
  jsx: false,
  loc: true,
  // eslint-disable-next-line no-console
  log: console.log,
  preserveNodeMaps: true,
  projects: [],
  range: true,
  strict: false,
  tokens: [],
  tsconfigRootDir: '/',
  EXPERIMENTAL_useSourceOfProjectReferenceRedirect: false,
  singleRun: false,
  programs: null,
  moduleResolver: '',
};
