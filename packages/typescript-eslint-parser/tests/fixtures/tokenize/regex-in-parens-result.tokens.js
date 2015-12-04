// (/foo/).test(bar);
module.exports = [
    {
        "type": "Punctuator",
        "value": "(",
        "range": [
            0,
            1
        ],
        "loc": {
            "start": {
                "line": 1,
                "column": 0
            },
            "end": {
                "line": 1,
                "column": 1
            }
        }
    },
    {
        "type": "RegularExpression",
        "value": "/foo/",
        "range": [
            1,
            6
        ],
        "regex": {
            "flags": "",
            "pattern": "foo"
        },
        "loc": {
            "start": {
                "line": 1,
                "column": 1
            },
            "end": {
                "line": 1,
                "column": 6
            }
        }
    },
    {
        "type": "Punctuator",
        "value": ")",
        "range": [
            6,
            7
        ],
        "loc": {
            "start": {
                "line": 1,
                "column": 6
            },
            "end": {
                "line": 1,
                "column": 7
            }
        }
    },
    {
        "type": "Punctuator",
        "value": ".",
        "range": [
            7,
            8
        ],
        "loc": {
            "start": {
                "line": 1,
                "column": 7
            },
            "end": {
                "line": 1,
                "column": 8
            }
        }
    },
    {
        "type": "Identifier",
        "value": "test",
        "range": [
            8,
            12
        ],
        "loc": {
            "start": {
                "line": 1,
                "column": 8
            },
            "end": {
                "line": 1,
                "column": 12
            }
        }
    },
    {
        "type": "Punctuator",
        "value": "(",
        "range": [
            12,
            13
        ],
        "loc": {
            "start": {
                "line": 1,
                "column": 12
            },
            "end": {
                "line": 1,
                "column": 13
            }
        }
    },
    {
        "type": "Identifier",
        "value": "bar",
        "range": [
            13,
            16
        ],
        "loc": {
            "start": {
                "line": 1,
                "column": 13
            },
            "end": {
                "line": 1,
                "column": 16
            }
        }
    },
    {
        "type": "Punctuator",
        "value": ")",
        "range": [
            16,
            17
        ],
        "loc": {
            "start": {
                "line": 1,
                "column": 16
            },
            "end": {
                "line": 1,
                "column": 17
            }
        }
    },
    {
        "type": "Punctuator",
        "value": ";",
        "range": [
            17,
            18
        ],
        "loc": {
            "start": {
                "line": 1,
                "column": 17
            },
            "end": {
                "line": 1,
                "column": 18
            }
        }
    }
];
