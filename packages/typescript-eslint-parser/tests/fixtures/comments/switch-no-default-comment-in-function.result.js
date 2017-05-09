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
        133
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
                133
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
                            "column": 14
                        }
                    },
                    "range": [
                        13,
                        14
                    ],
                    "name": "a"
                }
            ],
            "body": {
                "type": "BlockStatement",
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 16
                    },
                    "end": {
                        "line": 9,
                        "column": 1
                    }
                },
                "range": [
                    16,
                    133
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
                            22,
                            131
                        ],
                        "discriminant": {
                            "type": "Identifier",
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 12
                                },
                                "end": {
                                    "line": 2,
                                    "column": 13
                                }
                            },
                            "range": [
                                30,
                                31
                            ],
                            "name": "a"
                        },
                        "cases": [
                            {
                                "type": "SwitchCase",
                                "loc": {
                                    "start": {
                                        "line": 3,
                                        "column": 8
                                    },
                                    "end": {
                                        "line": 4,
                                        "column": 18
                                    }
                                },
                                "range": [
                                    43,
                                    69
                                ],
                                "consequent": [
                                    {
                                        "type": "BreakStatement",
                                        "loc": {
                                            "start": {
                                                "line": 4,
                                                "column": 12
                                            },
                                            "end": {
                                                "line": 4,
                                                "column": 18
                                            }
                                        },
                                        "range": [
                                            63,
                                            69
                                        ],
                                        "label": null
                                    }
                                ],
                                "test": {
                                    "type": "Literal",
                                    "loc": {
                                        "start": {
                                            "line": 3,
                                            "column": 13
                                        },
                                        "end": {
                                            "line": 3,
                                            "column": 14
                                        }
                                    },
                                    "range": [
                                        48,
                                        49
                                    ],
                                    "value": 2,
                                    "raw": "2"
                                }
                            },
                            {
                                "type": "SwitchCase",
                                "loc": {
                                    "start": {
                                        "line": 5,
                                        "column": 8
                                    },
                                    "end": {
                                        "line": 6,
                                        "column": 18
                                    }
                                },
                                "range": [
                                    78,
                                    104
                                ],
                                "consequent": [
                                    {
                                        "type": "BreakStatement",
                                        "loc": {
                                            "start": {
                                                "line": 6,
                                                "column": 12
                                            },
                                            "end": {
                                                "line": 6,
                                                "column": 18
                                            }
                                        },
                                        "range": [
                                            98,
                                            104
                                        ],
                                        "label": null
                                    }
                                ],
                                "test": {
                                    "type": "Literal",
                                    "loc": {
                                        "start": {
                                            "line": 5,
                                            "column": 13
                                        },
                                        "end": {
                                            "line": 5,
                                            "column": 14
                                        }
                                    },
                                    "range": [
                                        83,
                                        84
                                    ],
                                    "value": 1,
                                    "raw": "1"
                                }
                            }
                        ]
                    }
                ]
            },
            "expression": false,
            "async": false,
            "generator": false
        }
    ],
    "sourceType": "script",
    "comments": [
        {
            "type": "Line",
            "value": "no default",
            "range": [
                113,
                125
            ],
            "loc": {
                "start": {
                    "line": 7,
                    "column": 8
                },
                "end": {
                    "line": 7,
                    "column": 20
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
            "value": "a",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 13
                },
                "end": {
                    "line": 1,
                    "column": 14
                }
            },
            "range": [
                13,
                14
            ]
        },
        {
            "type": "Punctuator",
            "value": ")",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 14
                },
                "end": {
                    "line": 1,
                    "column": 15
                }
            },
            "range": [
                14,
                15
            ]
        },
        {
            "type": "Punctuator",
            "value": "{",
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
                22,
                28
            ]
        },
        {
            "type": "Punctuator",
            "value": "(",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 11
                },
                "end": {
                    "line": 2,
                    "column": 12
                }
            },
            "range": [
                29,
                30
            ]
        },
        {
            "type": "Identifier",
            "value": "a",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 12
                },
                "end": {
                    "line": 2,
                    "column": 13
                }
            },
            "range": [
                30,
                31
            ]
        },
        {
            "type": "Punctuator",
            "value": ")",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 13
                },
                "end": {
                    "line": 2,
                    "column": 14
                }
            },
            "range": [
                31,
                32
            ]
        },
        {
            "type": "Punctuator",
            "value": "{",
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
                33,
                34
            ]
        },
        {
            "type": "Keyword",
            "value": "case",
            "loc": {
                "start": {
                    "line": 3,
                    "column": 8
                },
                "end": {
                    "line": 3,
                    "column": 12
                }
            },
            "range": [
                43,
                47
            ]
        },
        {
            "type": "Numeric",
            "value": "2",
            "loc": {
                "start": {
                    "line": 3,
                    "column": 13
                },
                "end": {
                    "line": 3,
                    "column": 14
                }
            },
            "range": [
                48,
                49
            ]
        },
        {
            "type": "Punctuator",
            "value": ":",
            "loc": {
                "start": {
                    "line": 3,
                    "column": 14
                },
                "end": {
                    "line": 3,
                    "column": 15
                }
            },
            "range": [
                49,
                50
            ]
        },
        {
            "type": "Keyword",
            "value": "break",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 12
                },
                "end": {
                    "line": 4,
                    "column": 17
                }
            },
            "range": [
                63,
                68
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 17
                },
                "end": {
                    "line": 4,
                    "column": 18
                }
            },
            "range": [
                68,
                69
            ]
        },
        {
            "type": "Keyword",
            "value": "case",
            "loc": {
                "start": {
                    "line": 5,
                    "column": 8
                },
                "end": {
                    "line": 5,
                    "column": 12
                }
            },
            "range": [
                78,
                82
            ]
        },
        {
            "type": "Numeric",
            "value": "1",
            "loc": {
                "start": {
                    "line": 5,
                    "column": 13
                },
                "end": {
                    "line": 5,
                    "column": 14
                }
            },
            "range": [
                83,
                84
            ]
        },
        {
            "type": "Punctuator",
            "value": ":",
            "loc": {
                "start": {
                    "line": 5,
                    "column": 14
                },
                "end": {
                    "line": 5,
                    "column": 15
                }
            },
            "range": [
                84,
                85
            ]
        },
        {
            "type": "Keyword",
            "value": "break",
            "loc": {
                "start": {
                    "line": 6,
                    "column": 12
                },
                "end": {
                    "line": 6,
                    "column": 17
                }
            },
            "range": [
                98,
                103
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 6,
                    "column": 17
                },
                "end": {
                    "line": 6,
                    "column": 18
                }
            },
            "range": [
                103,
                104
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
                130,
                131
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
                132,
                133
            ]
        }
    ]
};