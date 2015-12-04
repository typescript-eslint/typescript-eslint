module.exports = [{
            type: 'Keyword',
            value: 'var',
            range: [0, 3],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 3 }
            }
        }, {
            type: 'Identifier',
            value: 'x',
            range: [4, 5],
            loc: {
                start: { line: 1, column: 4 },
                end: { line: 1, column: 5 }
            }
        }, {
            type: 'Punctuator',
            value: '=',
            range: [6, 7],
            loc: {
                start: { line: 1, column: 6 },
                end: { line: 1, column: 7 }
            }
        }, {
            type: 'RegularExpression',
            value: '/[\\u{0000000000000061}-\\u{7A}]/u',
            regex: {
                pattern: '[\\u{0000000000000061}-\\u{7A}]',
                flags: 'u'
            },
            range: [8, 40],
            loc: {
                start: { line: 1, column: 8 },
                end: { line: 1, column: 40 }
            }
        }];
