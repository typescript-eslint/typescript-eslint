// import { Extra } from '@typescript-eslint/typescript-estree/dist/src/parser-options';
import type { ParserOptions } from '@typescript-eslint/parser';
import type { Linter } from 'eslint';
import type { editor as editorApi } from 'monaco-editor/esm/vs/editor/editor.api';

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

export const defaultOptions: editorApi.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  fontSize: 13,
  wordWrap: 'off',
  scrollBeyondLastLine: false,
  smoothScrolling: true,
};

export const defaultCode = `/* eslint @typescript-eslint/class-literal-property-style: ["error", "fields"] */
/* eslint @typescript-eslint/adjacent-overload-signatures: ["error"] */
/* eslint @typescript-eslint/array-type: ["error", { default: "generic" }] */

class Mx {
  public static get myField1() {
    return 1;
  }

  private get ['myField2']() {
    return 'hello world';
  }
}

const x: string[] = ['a', 'b'];
const y: readonly string[] = ['a', 'b'];
`;

export const defaultParserOptions: ParserOptions = {
  ecmaFeatures: {
    jsx: false,
    globalReturn: false,
  },
  ecmaVersion: 2020,
  project: ['./tsconfig.json'],
  sourceType: 'script',
};

export const defaultRules: Linter.RulesRecord = {
  '@typescript-eslint/array-type': ['error', { default: 'generic' }],
};
