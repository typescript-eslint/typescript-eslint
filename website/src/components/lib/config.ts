// import { Extra } from '@typescript-eslint/typescript-estree/dist/src/parser-options';
// TODO: Extra type is not exported
export const extra: any = {
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
  log: console.log, // eslint-disable-line no-console
  preserveNodeMaps: true,
  projects: [],
  range: true,
  strict: false,
  tokens: [],
  tsconfigRootDir: '/',
  useJSXTextNode: true,
};
