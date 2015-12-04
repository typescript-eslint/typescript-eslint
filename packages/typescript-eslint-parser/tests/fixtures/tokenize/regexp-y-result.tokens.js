// var foo = /foo/y;
module.exports = [
    {
        "type": "Keyword",
        "value": "var",
        "range": [
            0,
            3
        ],
        "loc": {
            "start": {
                "line": 1,
                "column": 0
            },
            "end": {
                "line": 1,
                "column": 3
            }
        }
    },
    {
        "type": "Identifier",
        "value": "foo",
        "range": [
            4,
            7
        ],
        "loc": {
            "start": {
                "line": 1,
                "column": 4
            },
            "end": {
                "line": 1,
                "column": 7
            }
        }
    },
    {
        "type": "Punctuator",
        "value": "=",
        "range": [
            8,
            9
        ],
        "loc": {
            "start": {
                "line": 1,
                "column": 8
            },
            "end": {
                "line": 1,
                "column": 9
            }
        }
    },
    {
        "type": "RegularExpression",
        "value": "/foo/y",
        "regex": {
            "pattern": "foo",
            "flags": "y"
        },
        "range": [
            10,
            16
        ],
        "loc": {
            "start": {
                "line": 1,
                "column": 10
            },
            "end": {
                "line": 1,
                "column": 16
            }
        }
    },
    {
        "type": "Punctuator",
        "value": ";",
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
    }
];
