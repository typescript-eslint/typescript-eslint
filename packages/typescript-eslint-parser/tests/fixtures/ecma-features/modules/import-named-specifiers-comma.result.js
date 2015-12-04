module.exports = {
    "type": "Program",
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 1,
            "column": 30
        }
    },
    "range": [
        0,
        30
    ],
    "body": [
        {
            "type": "ImportDeclaration",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 30
                }
            },
            "range": [
                0,
                30
            ],
            "specifiers": [
                {
                    "type": "ImportSpecifier",
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 8
                        },
                        "end": {
                            "line": 1,
                            "column": 11
                        }
                    },
                    "range": [
                        8,
                        11
                    ],
                    "imported": {
                        "type": "Identifier",
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 8
                            },
                            "end": {
                                "line": 1,
                                "column": 11
                            }
                        },
                        "range": [
                            8,
                            11
                        ],
                        "name": "bar"
                    },
                    "local": {
                        "type": "Identifier",
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 8
                            },
                            "end": {
                                "line": 1,
                                "column": 11
                            }
                        },
                        "range": [
                            8,
                            11
                        ],
                        "name": "bar"
                    }
                },
                {
                    "type": "ImportSpecifier",
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 13
                        },
                        "end": {
                            "line": 1,
                            "column": 16
                        }
                    },
                    "range": [
                        13,
                        16
                    ],
                    "imported": {
                        "type": "Identifier",
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 13
                            },
                            "end": {
                                "line": 1,
                                "column": 16
                            }
                        },
                        "range": [
                            13,
                            16
                        ],
                        "name": "baz"
                    },
                    "local": {
                        "type": "Identifier",
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 13
                            },
                            "end": {
                                "line": 1,
                                "column": 16
                            }
                        },
                        "range": [
                            13,
                            16
                        ],
                        "name": "baz"
                    }
                }
            ],
            "source": {
                "type": "Literal",
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 24
                    },
                    "end": {
                        "line": 1,
                        "column": 29
                    }
                },
                "range": [
                    24,
                    29
                ],
                "value": "foo",
                "raw": "\"foo\""
            }
        }
    ],
    "sourceType": "module",
    "tokens": [
        {
            "type": "Keyword",
            "value": "import",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 6
                }
            },
            "range": [
                0,
                6
            ]
        },
        {
            "type": "Punctuator",
            "value": "{",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 7
                },
                "end": {
                    "line": 1,
                    "column": 8
                }
            },
            "range": [
                7,
                8
            ]
        },
        {
            "type": "Identifier",
            "value": "bar",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 8
                },
                "end": {
                    "line": 1,
                    "column": 11
                }
            },
            "range": [
                8,
                11
            ]
        },
        {
            "type": "Punctuator",
            "value": ",",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 11
                },
                "end": {
                    "line": 1,
                    "column": 12
                }
            },
            "range": [
                11,
                12
            ]
        },
        {
            "type": "Identifier",
            "value": "baz",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 13
                },
                "end": {
                    "line": 1,
                    "column": 16
                }
            },
            "range": [
                13,
                16
            ]
        },
        {
            "type": "Punctuator",
            "value": ",",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 16
                },
                "end": {
                    "line": 1,
                    "column": 17
                }
            },
            "range": [
                16,
                17
            ]
        },
        {
            "type": "Punctuator",
            "value": "}",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 17
                },
                "end": {
                    "line": 1,
                    "column": 18
                }
            },
            "range": [
                17,
                18
            ]
        },
        {
            "type": "Identifier",
            "value": "from",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 19
                },
                "end": {
                    "line": 1,
                    "column": 23
                }
            },
            "range": [
                19,
                23
            ]
        },
        {
            "type": "String",
            "value": "\"foo\"",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 24
                },
                "end": {
                    "line": 1,
                    "column": 29
                }
            },
            "range": [
                24,
                29
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 29
                },
                "end": {
                    "line": 1,
                    "column": 30
                }
            },
            "range": [
                29,
                30
            ]
        }
    ]
};