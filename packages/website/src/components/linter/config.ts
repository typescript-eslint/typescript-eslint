import type { CanonicalPath } from '@site/../typescript-estree/dist/create-program/shared';
import type { ParseSettings } from '@typescript-eslint/typescript-estree/dist/parseSettings';

export const parseSettings: ParseSettings = {
  code: '',
  comment: true,
  comments: [],
  createDefaultProgram: false,
  debugLevel: new Set(),
  errorOnUnknownASTType: false,
  extraFileExtensions: [],
  filePath: '' as CanonicalPath,
  jsx: false,
  loc: true,
  // eslint-disable-next-line no-console
  log: console.log,
  preserveNodeMaps: true,
  projects: [],
  range: true,
  tokens: [],
  tsconfigRootDir: '/' as CanonicalPath,
  errorOnTypeScriptSyntacticAndSemanticIssues: false,
  EXPERIMENTAL_useSourceOfProjectReferenceRedirect: false,
  EXPERIMENTAL_useLanguageService: false,
  singleRun: false,
  programs: null,
  moduleResolver: '',
};
