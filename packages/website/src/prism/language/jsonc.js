/* global Prism */

// https://www.json.org/json-en.html
Prism.languages.cjson = {
  boolean: /\b(?:false|true)\b/,
  comment: {
    greedy: true,
    pattern: /\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,
  },
  null: {
    alias: 'keyword',
    pattern: /\bnull\b/,
  },
  number: /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,
  operator: /:/,
  property: {
    greedy: true,
    lookbehind: true,
    pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,
  },
  punctuation: /[{}[\],]/,
  string: {
    greedy: true,
    lookbehind: true,
    pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,
  },
};

Prism.languages.jsonc = Prism.languages.cjson;
