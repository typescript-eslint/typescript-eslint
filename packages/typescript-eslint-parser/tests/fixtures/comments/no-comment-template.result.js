module.exports = {
    "type": "Program",
    "range": [
        0,
        37
    ],
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 1,
            "column": 37
        }
    },
    "body": [
        {
            "type": "VariableDeclaration",
            "range": [
                0,
                37
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 37
                }
            },
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "range": [
                        6,
                        36
                    ],
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 6
                        },
                        "end": {
                            "line": 1,
                            "column": 36
                        }
                    },
                    "id": {
                        "type": "Identifier",
                        "range": [
                            6,
                            9
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 6
                            },
                            "end": {
                                "line": 1,
                                "column": 9
                            }
                        },
                        "name": "str"
                    },
                    "init": {
                        "type": "TemplateLiteral",
                        "range": [
                            12,
                            36
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 12
                            },
                            "end": {
                                "line": 1,
                                "column": 36
                            }
                        },
                        "quasis": [
                            {
                                "type": "TemplateElement",
                                "range": [
                                    12,
                                    15
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 12
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 15
                                    }
                                },
                                "value": {
                                    "raw": "",
                                    "cooked": ""
                                },
                                "tail": false
                            },
                            {
                                "type": "TemplateElement",
                                "range": [
                                    24,
                                    36
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 24
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 36
                                    }
                                },
                                "value": {
                                    "raw": "/test/*.js",
                                    "cooked": "/test/*.js"
                                },
                                "tail": true
                            }
                        ],
                        "expressions": [
                            {
                                "type": "Identifier",
                                "range": [
                                    15,
                                    24
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 15
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 24
                                    }
                                },
                                "name": "__dirname"
                            }
                        ]
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
            "value": "str",
            "range": [
                6,
                9
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 6
                },
                "end": {
                    "line": 1,
                    "column": 9
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "=",
            "range": [
                10,
                11
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 10
                },
                "end": {
                    "line": 1,
                    "column": 11
                }
            }
        },
        {
            "type": "Template",
            "value": "`${",
            "range": [
                12,
                15
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 12
                },
                "end": {
                    "line": 1,
                    "column": 15
                }
            }
        },
        {
            "type": "Identifier",
            "value": "__dirname",
            "range": [
                15,
                24
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 15
                },
                "end": {
                    "line": 1,
                    "column": 24
                }
            }
        },
        {
            "type": "Template",
            "value": "}/test/*.js`",
            "range": [
                24,
                36
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 24
                },
                "end": {
                    "line": 1,
                    "column": 36
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ";",
            "range": [
                36,
                37
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 36
                },
                "end": {
                    "line": 1,
                    "column": 37
                }
            }
        }
    ],
    "comments": []
};
