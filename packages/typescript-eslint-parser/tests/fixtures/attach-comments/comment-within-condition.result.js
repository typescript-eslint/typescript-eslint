module.exports = {
    "type": "Program",
    "loc": {
        "start": {
            "line": 2,
            "column": 0
        },
        "end": {
            "line": 2,
            "column": 20
        }
    },
    "range": [
        10,
        30
    ],
    "body": [
        {
            "type": "IfStatement",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 0
                },
                "end": {
                    "line": 2,
                    "column": 20
                }
            },
            "range": [
                10,
                30
            ],
            "test": {
                "type": "Identifier",
                "loc": {
                    "start": {
                        "line": 2,
                        "column": 15
                    },
                    "end": {
                        "line": 2,
                        "column": 16
                    }
                },
                "range": [
                    25,
                    26
                ],
                "name": "a"
            },
            "consequent": {
                "type": "BlockStatement",
                "loc": {
                    "start": {
                        "line": 2,
                        "column": 18
                    },
                    "end": {
                        "line": 2,
                        "column": 20
                    }
                },
                "range": [
                    28,
                    30
                ],
                "body": []
            },
            "alternate": null
        }
    ],
    "sourceType": "script",
    "comments": [
        {
            "type": "Block",
            "value": " foo ",
            "range": [
                0,
                9
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 9
                }
            }
        },
        {
            "type": "Block",
            "value": " bar ",
            "range": [
                14,
                23
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 4
                },
                "end": {
                    "line": 2,
                    "column": 13
                }
            }
        }
    ],
    "tokens": [
        {
            "type": "Keyword",
            "value": "if",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 0
                },
                "end": {
                    "line": 2,
                    "column": 2
                }
            },
            "range": [
                10,
                12
            ]
        },
        {
            "type": "Punctuator",
            "value": "(",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 3
                },
                "end": {
                    "line": 2,
                    "column": 4
                }
            },
            "range": [
                13,
                14
            ]
        },
        {
            "type": "Identifier",
            "value": "a",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 15
                },
                "end": {
                    "line": 2,
                    "column": 16
                }
            },
            "range": [
                25,
                26
            ]
        },
        {
            "type": "Punctuator",
            "value": ")",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 16
                },
                "end": {
                    "line": 2,
                    "column": 17
                }
            },
            "range": [
                26,
                27
            ]
        },
        {
            "type": "Punctuator",
            "value": "{",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 18
                },
                "end": {
                    "line": 2,
                    "column": 19
                }
            },
            "range": [
                28,
                29
            ]
        },
        {
            "type": "Punctuator",
            "value": "}",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 19
                },
                "end": {
                    "line": 2,
                    "column": 20
                }
            },
            "range": [
                29,
                30
            ]
        }
    ]
};