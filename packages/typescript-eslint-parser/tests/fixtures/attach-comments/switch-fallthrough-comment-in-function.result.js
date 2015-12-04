module.exports = {
    "type": "Program",
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 9,
            "column": 1
        }
    },
    "range": [
        0,
        141
    ],
    "body": [
        {
            "type": "FunctionDeclaration",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 9,
                    "column": 1
                }
            },
            "range": [
                0,
                141
            ],
            "id": {
                "type": "Identifier",
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 9
                    },
                    "end": {
                        "line": 1,
                        "column": 12
                    }
                },
                "range": [
                    9,
                    12
                ],
                "name": "bar"
            },
            "params": [
                {
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
                    "name": "foo"
                }
            ],
            "body": {
                "type": "BlockStatement",
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 18
                    },
                    "end": {
                        "line": 9,
                        "column": 1
                    }
                },
                "range": [
                    18,
                    141
                ],
                "body": [
                    {
                        "type": "SwitchStatement",
                        "loc": {
                            "start": {
                                "line": 2,
                                "column": 4
                            },
                            "end": {
                                "line": 8,
                                "column": 5
                            }
                        },
                        "range": [
                            24,
                            139
                        ],
                        "discriminant": {
                            "type": "Identifier",
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 11
                                },
                                "end": {
                                    "line": 2,
                                    "column": 14
                                }
                            },
                            "range": [
                                31,
                                34
                            ],
                            "name": "foo"
                        },
                        "cases": [
                            {
                                "type": "SwitchCase",
                                "loc": {
                                    "start": {
                                        "line": 4,
                                        "column": 8
                                    },
                                    "end": {
                                        "line": 4,
                                        "column": 15
                                    }
                                },
                                "range": [
                                    61,
                                    68
                                ],
                                "consequent": [],
                                "test": {
                                    "type": "Literal",
                                    "loc": {
                                        "start": {
                                            "line": 4,
                                            "column": 13
                                        },
                                        "end": {
                                            "line": 4,
                                            "column": 14
                                        }
                                    },
                                    "range": [
                                        66,
                                        67
                                    ],
                                    "value": 1,
                                    "raw": "1"
                                },
                                "leadingComments": [
                                    {
                                        "type": "Line",
                                        "value": " foo",
                                        "range": [
                                            46,
                                            52
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 3,
                                                "column": 8
                                            },
                                            "end": {
                                                "line": 3,
                                                "column": 14
                                            }
                                        }
                                    }
                                ],
                                "trailingComments": [
                                    {
                                        "type": "Line",
                                        "value": " falls through",
                                        "range": [
                                            81,
                                            97
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 5,
                                                "column": 12
                                            },
                                            "end": {
                                                "line": 5,
                                                "column": 28
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                "type": "SwitchCase",
                                "loc": {
                                    "start": {
                                        "line": 6,
                                        "column": 8
                                    },
                                    "end": {
                                        "line": 7,
                                        "column": 19
                                    }
                                },
                                "range": [
                                    106,
                                    133
                                ],
                                "consequent": [
                                    {
                                        "type": "ExpressionStatement",
                                        "loc": {
                                            "start": {
                                                "line": 7,
                                                "column": 12
                                            },
                                            "end": {
                                                "line": 7,
                                                "column": 19
                                            }
                                        },
                                        "range": [
                                            126,
                                            133
                                        ],
                                        "expression": {
                                            "type": "CallExpression",
                                            "loc": {
                                                "start": {
                                                    "line": 7,
                                                    "column": 12
                                                },
                                                "end": {
                                                    "line": 7,
                                                    "column": 18
                                                }
                                            },
                                            "range": [
                                                126,
                                                132
                                            ],
                                            "callee": {
                                                "type": "Identifier",
                                                "loc": {
                                                    "start": {
                                                        "line": 7,
                                                        "column": 12
                                                    },
                                                    "end": {
                                                        "line": 7,
                                                        "column": 16
                                                    }
                                                },
                                                "range": [
                                                    126,
                                                    130
                                                ],
                                                "name": "doIt"
                                            },
                                            "arguments": []
                                        }
                                    }
                                ],
                                "test": {
                                    "type": "Literal",
                                    "loc": {
                                        "start": {
                                            "line": 6,
                                            "column": 13
                                        },
                                        "end": {
                                            "line": 6,
                                            "column": 14
                                        }
                                    },
                                    "range": [
                                        111,
                                        112
                                    ],
                                    "value": 2,
                                    "raw": "2"
                                },
                                "leadingComments": [
                                    {
                                        "type": "Line",
                                        "value": " falls through",
                                        "range": [
                                            81,
                                            97
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 5,
                                                "column": 12
                                            },
                                            "end": {
                                                "line": 5,
                                                "column": 28
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            "expression": false,
            "generator": false
        }
    ],
    "sourceType": "script",
    "comments": [
        {
            "type": "Line",
            "value": " foo",
            "range": [
                46,
                52
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 8
                },
                "end": {
                    "line": 3,
                    "column": 14
                }
            }
        },
        {
            "type": "Line",
            "value": " falls through",
            "range": [
                81,
                97
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 12
                },
                "end": {
                    "line": 5,
                    "column": 28
                }
            }
        }
    ],
    "tokens": [
        {
            "type": "Keyword",
            "value": "function",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 8
                }
            },
            "range": [
                0,
                8
            ]
        },
        {
            "type": "Identifier",
            "value": "bar",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 9
                },
                "end": {
                    "line": 1,
                    "column": 12
                }
            },
            "range": [
                9,
                12
            ]
        },
        {
            "type": "Punctuator",
            "value": "(",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 12
                },
                "end": {
                    "line": 1,
                    "column": 13
                }
            },
            "range": [
                12,
                13
            ]
        },
        {
            "type": "Identifier",
            "value": "foo",
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
            "value": ")",
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
            "value": "{",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 18
                },
                "end": {
                    "line": 1,
                    "column": 19
                }
            },
            "range": [
                18,
                19
            ]
        },
        {
            "type": "Keyword",
            "value": "switch",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 4
                },
                "end": {
                    "line": 2,
                    "column": 10
                }
            },
            "range": [
                24,
                30
            ]
        },
        {
            "type": "Punctuator",
            "value": "(",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 10
                },
                "end": {
                    "line": 2,
                    "column": 11
                }
            },
            "range": [
                30,
                31
            ]
        },
        {
            "type": "Identifier",
            "value": "foo",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 11
                },
                "end": {
                    "line": 2,
                    "column": 14
                }
            },
            "range": [
                31,
                34
            ]
        },
        {
            "type": "Punctuator",
            "value": ")",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 14
                },
                "end": {
                    "line": 2,
                    "column": 15
                }
            },
            "range": [
                34,
                35
            ]
        },
        {
            "type": "Punctuator",
            "value": "{",
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
                36,
                37
            ]
        },
        {
            "type": "Keyword",
            "value": "case",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 8
                },
                "end": {
                    "line": 4,
                    "column": 12
                }
            },
            "range": [
                61,
                65
            ]
        },
        {
            "type": "Numeric",
            "value": "1",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 13
                },
                "end": {
                    "line": 4,
                    "column": 14
                }
            },
            "range": [
                66,
                67
            ]
        },
        {
            "type": "Punctuator",
            "value": ":",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 14
                },
                "end": {
                    "line": 4,
                    "column": 15
                }
            },
            "range": [
                67,
                68
            ]
        },
        {
            "type": "Keyword",
            "value": "case",
            "loc": {
                "start": {
                    "line": 6,
                    "column": 8
                },
                "end": {
                    "line": 6,
                    "column": 12
                }
            },
            "range": [
                106,
                110
            ]
        },
        {
            "type": "Numeric",
            "value": "2",
            "loc": {
                "start": {
                    "line": 6,
                    "column": 13
                },
                "end": {
                    "line": 6,
                    "column": 14
                }
            },
            "range": [
                111,
                112
            ]
        },
        {
            "type": "Punctuator",
            "value": ":",
            "loc": {
                "start": {
                    "line": 6,
                    "column": 14
                },
                "end": {
                    "line": 6,
                    "column": 15
                }
            },
            "range": [
                112,
                113
            ]
        },
        {
            "type": "Identifier",
            "value": "doIt",
            "loc": {
                "start": {
                    "line": 7,
                    "column": 12
                },
                "end": {
                    "line": 7,
                    "column": 16
                }
            },
            "range": [
                126,
                130
            ]
        },
        {
            "type": "Punctuator",
            "value": "(",
            "loc": {
                "start": {
                    "line": 7,
                    "column": 16
                },
                "end": {
                    "line": 7,
                    "column": 17
                }
            },
            "range": [
                130,
                131
            ]
        },
        {
            "type": "Punctuator",
            "value": ")",
            "loc": {
                "start": {
                    "line": 7,
                    "column": 17
                },
                "end": {
                    "line": 7,
                    "column": 18
                }
            },
            "range": [
                131,
                132
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 7,
                    "column": 18
                },
                "end": {
                    "line": 7,
                    "column": 19
                }
            },
            "range": [
                132,
                133
            ]
        },
        {
            "type": "Punctuator",
            "value": "}",
            "loc": {
                "start": {
                    "line": 8,
                    "column": 4
                },
                "end": {
                    "line": 8,
                    "column": 5
                }
            },
            "range": [
                138,
                139
            ]
        },
        {
            "type": "Punctuator",
            "value": "}",
            "loc": {
                "start": {
                    "line": 9,
                    "column": 0
                },
                "end": {
                    "line": 9,
                    "column": 1
                }
            },
            "range": [
                140,
                141
            ]
        }
    ]
};