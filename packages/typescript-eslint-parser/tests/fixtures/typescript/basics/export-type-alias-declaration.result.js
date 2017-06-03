module.exports = {
    "type": "Program",
    "range": [
        0,
        40
    ],
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 1,
            "column": 40
        }
    },
    "body": [
        {
            "type": "ExportNamedDeclaration",
            "declaration": {
                "type": "VariableDeclaration",
                "range": [
                    7,
                    40
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 7
                    },
                    "end": {
                        "line": 1,
                        "column": 40
                    }
                },
                "kind": "type",
                "declarations": [
                    {
                        "type": "VariableDeclarator",
                        "id": {
                            "type": "Identifier",
                            "range": [
                                12,
                                21
                            ],
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 12
                                },
                                "end": {
                                    "line": 1,
                                    "column": 21
                                }
                            },
                            "name": "TestAlias"
                        },
                        "init": {
                            "type": "TSUnionType",
                            "range": [
                                24,
                                39
                            ],
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 24
                                },
                                "end": {
                                    "line": 1,
                                    "column": 39
                                }
                            },
                            "types": [
                                {
                                    "type": "TSStringKeyword",
                                    "range": [
                                        24,
                                        30
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 1,
                                            "column": 24
                                        },
                                        "end": {
                                            "line": 1,
                                            "column": 30
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
                                        "start": {
                                            "line": 1,
                                            "column": 33
                                        },
                                        "end": {
                                            "line": 1,
                                            "column": 39
                                        }
                                    }
                                }
                            ]
                        },
                        "range": [
                            12,
                            40
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 12
                            },
                            "end": {
                                "line": 1,
                                "column": 40
                            }
                        }
                    }
                ]
            },
            "range": [
                0,
                40
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 40
                }
            },
            "specifiers": [],
            "source": null
        }
    ],
    "sourceType": "module",
    "tokens": [
        {
            "type": "Keyword",
            "value": "export",
            "range": [
                0,
                6
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 6
                }
            }
        },
        {
            "type": "Identifier",
            "value": "type",
            "range": [
                7,
                11
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 7
                },
                "end": {
                    "line": 1,
                    "column": 11
                }
            }
        },
        {
            "type": "Identifier",
            "value": "TestAlias",
            "range": [
                12,
                21
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 12
                },
                "end": {
                    "line": 1,
                    "column": 21
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "=",
            "range": [
                22,
                23
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 22
                },
                "end": {
                    "line": 1,
                    "column": 23
                }
            }
        },
        {
            "type": "Identifier",
            "value": "string",
            "range": [
                24,
                30
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 24
                },
                "end": {
                    "line": 1,
                    "column": 30
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "|",
            "range": [
                31,
                32
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 31
                },
                "end": {
                    "line": 1,
                    "column": 32
                }
            }
        },
        {
            "type": "Identifier",
            "value": "number",
            "range": [
                33,
                39
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 33
                },
                "end": {
                    "line": 1,
                    "column": 39
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ";",
            "range": [
                39,
                40
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 39
                },
                "end": {
                    "line": 1,
                    "column": 40
                }
            }
        }
    ]
};