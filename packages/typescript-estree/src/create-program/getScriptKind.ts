import path from 'path';
import * as ts from 'typescript';

function getScriptKind(filePath: string, jsx: boolean): ts.ScriptKind {
  const extension = path.extname(filePath).toLowerCase();
  // note - we only respect the user's jsx setting for unknown extensions
  // this is so that we always match TS's internal script kind logic, preventing
  // weird errors due to a mismatch.
  // https://github.com/microsoft/TypeScript/blob/da00ba67ed1182ad334f7c713b8254fba174aeba/src/compiler/utilities.ts#L6948-L6968
  switch (extension) {
    case ts.Extension.Js:
    case ts.Extension.Cjs:
    case ts.Extension.Mjs:
      return ts.ScriptKind.JS;

    case ts.Extension.Jsx:
      return ts.ScriptKind.JSX;

    case ts.Extension.Ts:
    case ts.Extension.Cts:
    case ts.Extension.Mts:
      return ts.ScriptKind.TS;

    case ts.Extension.Tsx:
      return ts.ScriptKind.TSX;

    case ts.Extension.Json:
      return ts.ScriptKind.JSON;

    default:
      // unknown extension, force typescript to ignore the file extension, and respect the user's setting
      return jsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  }
}

function getLanguageVariant(scriptKind: ts.ScriptKind): ts.LanguageVariant {
  // https://github.com/microsoft/TypeScript/blob/d6e483b8dabd8fd37c00954c3f2184bb7f1eb90c/src/compiler/utilities.ts#L6281-L6285
  switch (scriptKind) {
    case ts.ScriptKind.TSX:
    case ts.ScriptKind.JSX:
    case ts.ScriptKind.JS:
    case ts.ScriptKind.JSON:
      return ts.LanguageVariant.JSX;

    default:
      return ts.LanguageVariant.Standard;
  }
}

export { getScriptKind, getLanguageVariant };
