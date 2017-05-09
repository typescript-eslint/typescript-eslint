module.exports = {
    "type": "Program",
    "range": [
        0,
        34
    ],
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 1,
            "column": 34
        }
    },
    "body": [
        {
            "type": "VariableDeclaration",
            "range": [
                0,
                34
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 34
                }
            },
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "range": [
                        6,
                        33
                    ],
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 6
                        },
                        "end": {
                            "line": 1,
                            "column": 33
                        }
                    },
                    "id": {
                        "type": "Identifier",
                        "range": [
                            6,
                            11
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 6
                            },
                            "end": {
                                "line": 1,
                                "column": 11
                            }
                        },
                        "name": "regex"
                    },
                    "init": {
                        "type": "Literal",
                        "range": [
                            14,
                            33
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 14
                            },
                            "end": {
                                "line": 1,
                                "column": 33
                            }
                        },
                        "value": null,
                        "raw": "/no comment\\/**foo/",
                        "regex": {
                            "pattern": "no comment\\/**foo",
                            "flags": ""
                        }
                    }
                }
            ],
            "kind": "const"
        }
    ],
    "sourceType": "script",
    "tokens": [
        {
            "type": "Keyword",
            "value": "const",
            "range": [
                0,
                5
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 5
                }
            }
        },
        {
            "type": "Identifier",
            "value": "regex",
            "range": [
                6,
                11
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 6
                },
                "end": {
                    "line": 1,
                    "column": 11
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "=",
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
            "type": "RegularExpression",
            "value": "/no comment\\/**foo/",
            "range": [
                14,
                33
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 14
                },
                "end": {
                    "line": 1,
                    "column": 33
                }
            },
            "regex": {
                "pattern": "no comment\\/**foo",
                "flags": ""
            }
        },
        {
            "type": "Punctuator",
            "value": ";",
            "range": [
                33,
                34
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 33
                },
                "end": {
                    "line": 1,
                    "column": 34
                }
            }
        }
    ],
    "comments": []
};
