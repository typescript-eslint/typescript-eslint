module.exports = {
    "type": "Program",
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 1,
            "column": 41
        }
    },
    "range": [
        0,
        41
    ],
    "body": [
        {
            "type": "VariableDeclaration",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 41
                }
            },
            "range": [
                0,
                41
            ],
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 4
                        },
                        "end": {
                            "line": 1,
                            "column": 40
                        }
                    },
                    "range": [
                        4,
                        40
                    ],
                    "id": {
                        "type": "Identifier",
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 4
                            },
                            "end": {
                                "line": 1,
                                "column": 5
                            }
                        },
                        "range": [
                            4,
                            5
                        ],
                        "name": "x"
                    },
                    "init": {
                        "type": "Literal",
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 8
                            },
                            "end": {
                                "line": 1,
                                "column": 40
                            }
                        },
                        "range": [
                            8,
                            40
                        ],
                        "value": null,
                        "raw": "/[\\u{0000000000000061}-\\u{7A}]/u",
                        "regex": {
                            "pattern": "[\\u{0000000000000061}-\\u{7A}]",
                            "flags": "u"
                        }
                    }
                }
            ],
            "kind": "var"
        }
    ],
    "sourceType": "script",
    "tokens": [
        {
            "type": "Keyword",
            "value": "var",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 3
                }
            },
            "range": [
                0,
                3
            ]
        },
        {
            "type": "Identifier",
            "value": "x",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 4
                },
                "end": {
                    "line": 1,
                    "column": 5
                }
            },
            "range": [
                4,
                5
            ]
        },
        {
            "type": "Punctuator",
            "value": "=",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 6
                },
                "end": {
                    "line": 1,
                    "column": 7
                }
            },
            "range": [
                6,
                7
            ]
        },
        {
            "type": "RegularExpression",
            "value": "/[\\u{0000000000000061}-\\u{7A}]/u",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 8
                },
                "end": {
                    "line": 1,
                    "column": 40
                }
            },
            "range": [
                8,
                40
            ],
            "regex": {
                "flags": "u",
                "pattern": "[\\u{0000000000000061}-\\u{7A}]"
            }
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 40
                },
                "end": {
                    "line": 1,
                    "column": 41
                }
            },
            "range": [
                40,
                41
            ]
        }
    ]
};