module.exports = {
    "type": "Program",
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 7,
            "column": 1
        }
    },
    "range": [
        0,
        91
    ],
    "body": [
        {
            "type": "SwitchStatement",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 7,
                    "column": 1
                }
            },
            "range": [
                0,
                91
            ],
            "discriminant": {
                "type": "Identifier",
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 7
                    },
                    "end": {
                        "line": 1,
                        "column": 10
                    }
                },
                "range": [
                    7,
                    10
                ],
                "name": "foo"
            },
            "cases": [
                {
                    "type": "SwitchCase",
                    "loc": {
                        "start": {
                            "line": 3,
                            "column": 4
                        },
                        "end": {
                            "line": 3,
                            "column": 11
                        }
                    },
                    "range": [
                        29,
                        36
                    ],
                    "consequent": [],
                    "test": {
                        "type": "Literal",
                        "loc": {
                            "start": {
                                "line": 3,
                                "column": 9
                            },
                            "end": {
                                "line": 3,
                                "column": 10
                            }
                        },
                        "range": [
                            34,
                            35
                        ],
                        "value": 1,
                        "raw": "1"
                    },
                    "leadingComments": [
                        {
                            "type": "Line",
                            "value": " foo",
                            "range": [
                                18,
                                24
                            ],
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 4
                                },
                                "end": {
                                    "line": 2,
                                    "column": 10
                                }
                            }
                        }
                    ],
                    "trailingComments": [
                        {
                            "type": "Line",
                            "value": " falls through",
                            "range": [
                                45,
                                61
                            ],
                            "loc": {
                                "start": {
                                    "line": 4,
                                    "column": 8
                                },
                                "end": {
                                    "line": 4,
                                    "column": 24
                                }
                            }
                        }
                    ]
                },
                {
                    "type": "SwitchCase",
                    "loc": {
                        "start": {
                            "line": 5,
                            "column": 4
                        },
                        "end": {
                            "line": 6,
                            "column": 15
                        }
                    },
                    "range": [
                        66,
                        89
                    ],
                    "consequent": [
                        {
                            "type": "ExpressionStatement",
                            "loc": {
                                "start": {
                                    "line": 6,
                                    "column": 8
                                },
                                "end": {
                                    "line": 6,
                                    "column": 15
                                }
                            },
                            "range": [
                                82,
                                89
                            ],
                            "expression": {
                                "type": "CallExpression",
                                "loc": {
                                    "start": {
                                        "line": 6,
                                        "column": 8
                                    },
                                    "end": {
                                        "line": 6,
                                        "column": 14
                                    }
                                },
                                "range": [
                                    82,
                                    88
                                ],
                                "callee": {
                                    "type": "Identifier",
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
                                        82,
                                        86
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
                                "line": 5,
                                "column": 9
                            },
                            "end": {
                                "line": 5,
                                "column": 10
                            }
                        },
                        "range": [
                            71,
                            72
                        ],
                        "value": 2,
                        "raw": "2"
                    },
                    "leadingComments": [
                        {
                            "type": "Line",
                            "value": " falls through",
                            "range": [
                                45,
                                61
                            ],
                            "loc": {
                                "start": {
                                    "line": 4,
                                    "column": 8
                                },
                                "end": {
                                    "line": 4,
                                    "column": 24
                                }
                            }
                        }
                    ]
                }
            ]
        }
    ],
    "sourceType": "script",
    "comments": [
        {
            "type": "Line",
            "value": " foo",
            "range": [
                18,
                24
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 4
                },
                "end": {
                    "line": 2,
                    "column": 10
                }
            }
        },
        {
            "type": "Line",
            "value": " falls through",
            "range": [
                45,
                61
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 8
                },
                "end": {
                    "line": 4,
                    "column": 24
                }
            }
        }
    ],
    "tokens": [
        {
            "type": "Keyword",
            "value": "switch",
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
            "value": "(",
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
            "type": "Identifier",
            "value": "foo",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 7
                },
                "end": {
                    "line": 1,
                    "column": 10
                }
            },
            "range": [
                7,
                10
            ]
        },
        {
            "type": "Punctuator",
            "value": ")",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 10
                },
                "end": {
                    "line": 1,
                    "column": 11
                }
            },
            "range": [
                10,
                11
            ]
        },
        {
            "type": "Punctuator",
            "value": "{",
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
            "type": "Keyword",
            "value": "case",
            "loc": {
                "start": {
                    "line": 3,
                    "column": 4
                },
                "end": {
                    "line": 3,
                    "column": 8
                }
            },
            "range": [
                29,
                33
            ]
        },
        {
            "type": "Numeric",
            "value": "1",
            "loc": {
                "start": {
                    "line": 3,
                    "column": 9
                },
                "end": {
                    "line": 3,
                    "column": 10
                }
            },
            "range": [
                34,
                35
            ]
        },
        {
            "type": "Punctuator",
            "value": ":",
            "loc": {
                "start": {
                    "line": 3,
                    "column": 10
                },
                "end": {
                    "line": 3,
                    "column": 11
                }
            },
            "range": [
                35,
                36
            ]
        },
        {
            "type": "Keyword",
            "value": "case",
            "loc": {
                "start": {
                    "line": 5,
                    "column": 4
                },
                "end": {
                    "line": 5,
                    "column": 8
                }
            },
            "range": [
                66,
                70
            ]
        },
        {
            "type": "Numeric",
            "value": "2",
            "loc": {
                "start": {
                    "line": 5,
                    "column": 9
                },
                "end": {
                    "line": 5,
                    "column": 10
                }
            },
            "range": [
                71,
                72
            ]
        },
        {
            "type": "Punctuator",
            "value": ":",
            "loc": {
                "start": {
                    "line": 5,
                    "column": 10
                },
                "end": {
                    "line": 5,
                    "column": 11
                }
            },
            "range": [
                72,
                73
            ]
        },
        {
            "type": "Identifier",
            "value": "doIt",
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
                82,
                86
            ]
        },
        {
            "type": "Punctuator",
            "value": "(",
            "loc": {
                "start": {
                    "line": 6,
                    "column": 12
                },
                "end": {
                    "line": 6,
                    "column": 13
                }
            },
            "range": [
                86,
                87
            ]
        },
        {
            "type": "Punctuator",
            "value": ")",
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
                87,
                88
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
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
                88,
                89
            ]
        },
        {
            "type": "Punctuator",
            "value": "}",
            "loc": {
                "start": {
                    "line": 7,
                    "column": 0
                },
                "end": {
                    "line": 7,
                    "column": 1
                }
            },
            "range": [
                90,
                91
            ]
        }
    ]
};