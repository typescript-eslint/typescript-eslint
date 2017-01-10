module.exports = {
    "type": "Program",
    "range": [
        0,
        40
    ],
    "loc": {
        "end": {
            "line": 1,
            "column": 40
        },
        "start": {
            "line": 1,
            "column": 0
        }
    },
    "body": [
        {
            "type": "ExportNamedDeclaration",
            "range": [
                0,
                40
            ],
            "loc": {
                "end": {
                    "line": 1,
                    "column": 40
                },
                "start": {
                    "line": 1,
                    "column": 0
                }
            },
            "declaration": {
                "type": "VariableDeclaration",
                "range": [
                    7,
                    40
                ],
                "loc": {
                    "end": {
                        "line": 1,
                        "column": 40
                    },
                    "start": {
                        "line": 1,
                        "column": 7
                    }
                },
                "kind": "type",
                "declarations": [
                    {
                        "type": "VariableDeclarator",
                        "range": [
                            12,
                            40
                        ],
                        "loc": {
                            "end": {
                                "line": 1,
                                "column": 40
                            },
                            "start": {
                                "line": 1,
                                "column": 12
                            }
                        },
                        "id": {
                            "type": "Identifier",
                            "range": [
                                12,
                                21
                            ],
                            "loc": {
                                "end": {
                                    "line": 1,
                                    "column": 21
                                },
                                "start": {
                                    "line": 1,
                                    "column": 12
                                }
                            },
                            "name": "TestAlias"
                        },
                        "init": {
                            "type": "TSUnionType",
                            "loc": {
                                "end": {
                                    "line": 1,
                                    "column": 39
                                },
                                "start": {
                                    "line": 1,
                                    "column": 24
                                }
                            },
                            "range": [
                                24,
                                39
                            ],
                            "types": [
                                {
                                    "type": "TSStringKeyword",
                                    "range": [
                                        24,
                                        30
                                    ],
                                    "loc": {
                                        "end": {
                                            "line": 1,
                                            "column": 30
                                        },
                                        "start": {
                                            "line": 1,
                                            "column": 24
                                        }
                                    }
                                },
                                {
                                    "type": "TSNumberKeyword",
                                    "range": [
                                        33,
                                        39
                                    ],
                                    "loc": {
                                        "end": {
                                            "line": 1,
                                            "column": 39
                                        },
                                        "start": {
                                            "line": 1,
                                            "column": 33
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            },
            "source": null,
            "specifiers": []
        }
    ],
    "sourceType": "module",
    "tokens": [
        {
            "type": "Keyword",
            "range": [
                0,
                6
            ],
            "loc": {
                "end": {
                    "line": 1,
                    "column": 6
                },
                "start": {
                    "line": 1,
                    "column": 0
                }
            },
            "value": "export"
        },
        {
            "type": "Identifier",
            "range": [
                7,
                11
            ],
            "loc": {
                "end": {
                    "line": 1,
                    "column": 11
                },
                "start": {
                    "line": 1,
                    "column": 7
                }
            },
            "value": "type"
        },
        {
            "type": "Identifier",
            "range": [
                12,
                21
            ],
            "loc": {
                "end": {
                    "line": 1,
                    "column": 21
                },
                "start": {
                    "line": 1,
                    "column": 12
                }
            },
            "value": "TestAlias"
        },
        {
            "type": "Punctuator",
            "range": [
                22,
                23
            ],
            "loc": {
                "end": {
                    "line": 1,
                    "column": 23
                },
                "start": {
                    "line": 1,
                    "column": 22
                }
            },
            "value": "="
        },
        {
            "type": "Identifier",
            "range": [
                24,
                30
            ],
            "loc": {
                "end": {
                    "line": 1,
                    "column": 30
                },
                "start": {
                    "line": 1,
                    "column": 24
                }
            },
            "value": "string"
        },
        {
            "type": "Punctuator",
            "range": [
                31,
                32
            ],
            "loc": {
                "end": {
                    "line": 1,
                    "column": 32
                },
                "start": {
                    "line": 1,
                    "column": 31
                }
            },
            "value": "|"
        },
        {
            "type": "Identifier",
            "range": [
                33,
                39
            ],
            "loc": {
                "end": {
                    "line": 1,
                    "column": 39
                },
                "start": {
                    "line": 1,
                    "column": 33
                }
            },
            "value": "number"
        },
        {
            "type": "Punctuator",
            "range": [
                39,
                40
            ],
            "loc": {
                "end": {
                    "line": 1,
                    "column": 40
                },
                "start": {
                    "line": 1,
                    "column": 39
                }
            },
            "value": ";"
        }
    ]
};
