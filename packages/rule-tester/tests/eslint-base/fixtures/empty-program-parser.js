// Forked from https://github.com/eslint/eslint/blob/ad9dd6a933fd098a0d99c6a9aa059850535c23ee/tests/fixtures/parsers/empty-program-parser.js

"use strict";

exports.parse = function (text, parserOptions) {
    return {
        "type": "Program",
        "start": 0,
        "end": 0,
        "loc": {
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 0
          }
        },
        "range": [
          0,
          0
        ],
        "body": [],
        "sourceType": "script",
        "comments": [],
        "tokens": []
      };
};
