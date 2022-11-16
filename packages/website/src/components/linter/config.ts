import type { ParseSettings } from '@typescript-eslint/typescript-estree/dist/parseSettings';

export const parseSettings: ParseSettings = {
  code: '',
  codeFullText: '',
  comment: true,
  comments: [],
  DEPRECATED__createDefaultProgram: false,
  debugLevel: new Set(),
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
  tokens: [],
  tsconfigRootDir: '/',
  errorOnTypeScriptSyntacticAndSemanticIssues: false,
  EXPERIMENTAL_useSourceOfProjectReferenceRedirect: false,
  singleRun: false,
  programs: null,
  moduleResolver: '',
};
