module.exports = {
    "type": "Program",
    "range": [
        0,
        56
    ],
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 3,
            "column": 1
        }
    },
    "body": [
        {
            "type": "TSModuleDeclaration",
            "range": [
                0,
                56
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 3,
                    "column": 1
                }
            },
            "modifiers": [
                {
                    "type": "TSDeclareKeyword",
                    "range": [
                        0,
                        7
                    ],
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 0
                        },
                        "end": {
                            "line": 1,
                            "column": 7
                        }
                    }
                }
            ],
            "name": {
                "type": "Literal",
                "range": [
                    15,
                    29
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 15
                    },
                    "end": {
                        "line": 1,
                        "column": 29
                    }
                },
                "value": "i-use-things",
                "raw": "\"i-use-things\""
            },
            "body": {
                "type": "TSModuleBlock",
                "range": [
                    30,
                    56
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 30
                    },
                    "end": {
                        "line": 3,
                        "column": 1
                    }
                },
                "body": [
                    {
                        "type": "ImportDeclaration",
                        "range": [
                            34,
                            54
                        ],
                        "loc": {
                            "start": {
                                "line": 2,
                                "column": 2
                            },
                            "end": {
                                "line": 2,
                                "column": 22
                            }
                        },
                        "source": {
                            "type": "Literal",
                            "range": [
                                49,
                                53
                            ],
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 17
                                },
                                "end": {
                                    "line": 2,
                                    "column": 21
                                }
                            },
                            "value": "fs",
                            "raw": "'fs'"
                        },
                        "specifiers": [
                            {
                                "type": "ImportDefaultSpecifier",
                                "range": [
                                    41,
                                    43
                                ],
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 9
                                    },
                                    "end": {
                                        "line": 2,
                                        "column": 11
                                    }
                                },
                                "local": {
                                    "type": "Identifier",
                                    "range": [
                                        41,
                                        43
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 2,
                                            "column": 9
                                        },
                                        "end": {
                                            "line": 2,
                                            "column": 11
                                        }
                                    },
                                    "name": "fs"
                                }
                            }
                        ]
                    }
                ]
            }
        }
    ],
    "sourceType": "script",
    "tokens": [
        {
            "type": "Identifier",
            "value": "declare",
            "range": [
                0,
                7
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 7
                }
            }
        },
        {
            "type": "Identifier",
            "value": "module",
            "range": [
                8,
                14
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 8
                },
                "end": {
                    "line": 1,
                    "column": 14
                }
            }
        },
        {
            "type": "String",
            "value": "\"i-use-things\"",
            "range": [
                15,
                29
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 15
                },
                "end": {
                    "line": 1,
                    "column": 29
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                30,
                31
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 30
                },
                "end": {
                    "line": 1,
                    "column": 31
                }
            }
        },
        {
            "type": "Keyword",
            "value": "import",
            "range": [
                34,
                40
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 2
                },
                "end": {
                    "line": 2,
                    "column": 8
                }
            }
        },
        {
            "type": "Identifier",
            "value": "fs",
            "range": [
                41,
                43
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 9
                },
                "end": {
                    "line": 2,
                    "column": 11
                }
            }
        },
        {
            "type": "Identifier",
            "value": "from",
            "range": [
                44,
                48
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 12
                },
                "end": {
                    "line": 2,
                    "column": 16
                }
            }
        },
        {
            "type": "String",
            "value": "'fs'",
            "range": [
                49,
                53
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 17
                },
                "end": {
                    "line": 2,
                    "column": 21
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ";",
            "range": [
                53,
                54
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 21
                },
                "end": {
                    "line": 2,
                    "column": 22
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                55,
                56
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 0
                },
                "end": {
                    "line": 3,
                    "column": 1
                }
            }
        }
    ]
};