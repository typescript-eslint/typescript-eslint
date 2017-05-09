module.exports = {
    "type": "Program",
    "range": [
        0,
        64
    ],
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 5,
            "column": 1
        }
    },
    "body": [
        {
            "type": "ExpressionStatement",
            "range": [
                0,
                10
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 10
                }
            },
            "expression": {
                "type": "TemplateLiteral",
                "range": [
                    0,
                    9
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 0
                    },
                    "end": {
                        "line": 1,
                        "column": 9
                    }
                },
                "quasis": [
                    {
                        "type": "TemplateElement",
                        "range": [
                            0,
                            3
                        ],
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
                        "value": {
                            "raw": "",
                            "cooked": ""
                        },
                        "tail": false
                    },
                    {
                        "type": "TemplateElement",
                        "range": [
                            7,
                            9
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 7
                            },
                            "end": {
                                "line": 1,
                                "column": 9
                            }
                        },
                        "value": {
                            "raw": "",
                            "cooked": ""
                        },
                        "tail": true
                    }
                ],
                "expressions": [
                    {
                        "type": "Identifier",
                        "range": [
                            3,
                            7
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 3
                            },
                            "end": {
                                "line": 1,
                                "column": 7
                            }
                        },
                        "name": "name"
                    }
                ]
            }
        },
        {
            "type": "BlockStatement",
            "range": [
                11,
                64
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 0
                },
                "end": {
                    "line": 5,
                    "column": 1
                }
            },
            "body": [
                {
                    "type": "ExpressionStatement",
                    "range": [
                        56,
                        62
                    ],
                    "loc": {
                        "start": {
                            "line": 4,
                            "column": 4
                        },
                        "end": {
                            "line": 4,
                            "column": 10
                        }
                    },
                    "expression": {
                        "type": "BinaryExpression",
                        "range": [
                            56,
                            61
                        ],
                        "loc": {
                            "start": {
                                "line": 4,
                                "column": 4
                            },
                            "end": {
                                "line": 4,
                                "column": 9
                            }
                        },
                        "operator": "+",
                        "left": {
                            "type": "Literal",
                            "range": [
                                56,
                                57
                            ],
                            "loc": {
                                "start": {
                                    "line": 4,
                                    "column": 4
                                },
                                "end": {
                                    "line": 4,
                                    "column": 5
                                }
                            },
                            "value": 1,
                            "raw": "1"
                        },
                        "right": {
                            "type": "Literal",
                            "range": [
                                60,
                                61
                            ],
                            "loc": {
                                "start": {
                                    "line": 4,
                                    "column": 8
                                },
                                "end": {
                                    "line": 4,
                                    "column": 9
                                }
                            },
                            "value": 1,
                            "raw": "1"
                        }
                    }
                }
            ]
        }
    ],
    "sourceType": "script",
    "tokens": [
        {
            "type": "Template",
            "value": "`${",
            "range": [
                0,
                3
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 3
                }
            }
        },
        {
            "type": "Identifier",
            "value": "name",
            "range": [
                3,
                7
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 3
                },
                "end": {
                    "line": 1,
                    "column": 7
                }
            }
        },
        {
            "type": "Template",
            "value": "}`",
            "range": [
                7,
                9
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 7
                },
                "end": {
                    "line": 1,
                    "column": 9
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ";",
            "range": [
                9,
                10
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 9
                },
                "end": {
                    "line": 1,
                    "column": 10
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                11,
                12
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 0
                },
                "end": {
                    "line": 2,
                    "column": 1
                }
            }
        },
        {
            "type": "Numeric",
            "value": "1",
            "range": [
                56,
                57
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 4
                },
                "end": {
                    "line": 4,
                    "column": 5
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "+",
            "range": [
                58,
                59
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 6
                },
                "end": {
                    "line": 4,
                    "column": 7
                }
            }
        },
        {
            "type": "Numeric",
            "value": "1",
            "range": [
                60,
                61
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 8
                },
                "end": {
                    "line": 4,
                    "column": 9
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ";",
            "range": [
                61,
                62
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 9
                },
                "end": {
                    "line": 4,
                    "column": 10
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                63,
                64
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 0
                },
                "end": {
                    "line": 5,
                    "column": 1
                }
            }
        }
    ],
    "comments": [
        {
            "type": "Block",
            "value": " TODO comment comment comment ",
            "range": [
                17,
                51
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 4
                },
                "end": {
                    "line": 3,
                    "column": 38
                }
            }
        }
    ]
};
