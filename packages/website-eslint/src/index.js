// eslint-disable-next-line no-undef,import/no-amd
define(['exports', 'vs/language/typescript/tsWorker'], function (e, _t) {
  const eslintPlugin = require('@typescript-eslint/eslint-plugin');
  const Linter = require('eslint').Linter;

  e.getScriptKind =
    require('@typescript-eslint/typescript-estree/use-at-your-own-risk/getScriptKind').getScriptKind;
  e.analyze =
    require('@typescript-eslint/scope-manager/use-at-your-own-risk/analyze').analyze;
  e.visitorKeys =
    require('@typescript-eslint/visitor-keys/use-at-your-own-risk/visitor-keys').visitorKeys;
  e.astConverter =
    require('@typescript-eslint/typescript-estree/use-at-your-own-risk/ast-converter').astConverter;
  e.esquery = require('esquery');

  e.createLinter = function () {
    const linter = new Linter();
    for (const name in eslintPlugin.rules) {
      linter.defineRule(`@typescript-eslint/${name}`, eslintPlugin.rules[name]);
    }
    return linter;
  };
});
