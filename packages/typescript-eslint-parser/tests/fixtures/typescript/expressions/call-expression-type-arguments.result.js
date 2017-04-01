module.exports = {
    "type": "Program",
    "range": [
        0,
        24
    ],
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 2,
            "column": 14
        }
    },
    "body": [
        {
            "expression": {
                "arguments": [],
                "callee": {
                    "loc": {
                        "end": {
                            "column": 3,
                            "line": 1
                        },
                        "start": {
                            "column": 0,
                            "line": 1
                        }
                    },
                    "name": "foo",
                    "range": [
                        0,
                        3
                    ],
                    "type": "Identifier"
                },
                "loc": {
                    "end": {
                        "column": 8,
                        "line": 1
                    },
                    "start": {
                        "column": 0,
                        "line": 1
                    }
                },
                "range": [
                    0,
                    8
                ],
                "type": "CallExpression",
                "typeParameters": {
                    "loc": {
                        "end": {
                            "column": 6,
                            "line": 1
                        },
                        "start": {
                            "column": 3,
                            "line": 1
                        }
                    },
                    "params": [
                        {
                            "id": {
                                "loc": {
                                    "end": {
                                        "column": 5,
                                        "line": 1
                                    },
                                    "start": {
                                        "column": 4,
                                        "line": 1
                                    }
                                },
                                "name": "A",
                                "range": [
                                    4,
                                    5
                                ],
                                "type": "Identifier"
                            },
                            "typeParameters": null,
                            "loc": {
                                "end": {
                                    "column": 5,
                                    "line": 1
                                },
                                "start": {
                                    "column": 4,
                                    "line": 1
                                }
                            },
                            "range": [
                                4,
                                5
                            ],
                            "type": "GenericTypeAnnotation"
                        }
                    ],
                    "range": [
                        3,
                        6
                    ],
                    "type": "TypeParameterInstantiation"
                }
            },
            "loc": {
                "end": {
                    "column": 9,
                    "line": 1
                },
                "start": {
                    "column": 0,
                    "line": 1
                }
            },
            "range": [
                0,
                9
            ],
            "type": "ExpressionStatement"
        },
        {
            "expression": {
                "arguments": [],
                "callee": {
                    "loc": {
                        "end": {
                            "column": 3,
                            "line": 2
                        },
                        "start": {
                            "column": 0,
                            "line": 2
                        }
                    },
                    "name": "foo",
                    "range": [
                        10,
                        13
                    ],
                    "type": "Identifier"
                },
                "loc": {
                    "end": {
                        "column": 13,
                        "line": 2
                    },
                    "start": {
                        "column": 0,
                        "line": 2
                    }
                },
                "range": [
                    10,
                    23
                ],
                "type": "CallExpression",
                "typeParameters": {
                    "loc": {
                        "end": {
                            "column": 11,
                            "line": 2
                        },
                        "start": {
                            "column": 3,
                            "line": 2
                        }
                    },
                    "params": [
                        {
                            "id": {
                                "loc": {
                                    "end": {
                                        "column": 10,
                                        "line": 2
                                    },
                                    "start": {
                                        "column": 4,
                                        "line": 2
                                    }
                                },
                                "range": [
                                    14,
                                    20
                                ],
                                "type": "TSNumberKeyword"
                            },
                            "typeParameters": null,
                            "loc": {
                                "end": {
                                    "column": 10,
                                    "line": 2
                                },
                                "start": {
                                    "column": 4,
                                    "line": 2
                                }
                            },
                            "range": [
                                14,
                                20
                            ],
                            "type": "GenericTypeAnnotation"
                        }
                    ],
                    "range": [
                        13,
                        21
                    ],
                    "type": "TypeParameterInstantiation"
                }
            },
            "loc": {
                "end": {
                    "column": 14,
                    "line": 2
                },
                "start": {
                    "column": 0,
                    "line": 2
                }
            },
            "range": [
                10,
                24
            ],
            "type": "ExpressionStatement"
        }
    ],
    "sourceType": "script",
    "tokens": [
        {
            "loc": {
                "end": {
                    "column": 3,
                    "line": 1
                },
                "start": {
                    "column": 0,
                    "line": 1
                }
            },
            "range": [
                0,
                3
            ],
            "type": "Identifier",
            "value": "foo"
        },
        {
            "loc": {
                "end": {
                    "column": 4,
                    "line": 1
                },
                "start": {
                    "column": 3,
                    "line": 1
                }
            },
            "range": [
                3,
                4
            ],
            "type": "Punctuator",
            "value": "<"
        },
        {
            "loc": {
                "end": {
                    "column": 5,
                    "line": 1
                },
                "start": {
                    "column": 4,
                    "line": 1
                }
            },
            "range": [
                4,
                5
            ],
            "type": "Identifier",
            "value": "A"
        },
        {
            "loc": {
                "end": {
                    "column": 6,
                    "line": 1
                },
                "start": {
                    "column": 5,
                    "line": 1
                }
            },
            "range": [
                5,
                6
            ],
            "type": "Punctuator",
            "value": ">"
        },
        {
            "loc": {
                "end": {
                    "column": 7,
                    "line": 1
                },
                "start": {
                    "column": 6,
                    "line": 1
                }
            },
            "range": [
                6,
                7
            ],
            "type": "Punctuator",
            "value": "("
        },
        {
            "loc": {
                "end": {
                    "column": 8,
                    "line": 1
                },
                "start": {
                    "column": 7,
                    "line": 1
                }
            },
            "range": [
                7,
                8
            ],
            "type": "Punctuator",
            "value": ")"
        },
        {
            "loc": {
                "end": {
                    "column": 9,
                    "line": 1
                },
                "start": {
                    "column": 8,
                    "line": 1
                }
            },
            "range": [
                8,
                9
            ],
            "type": "Punctuator",
            "value": ";"
        },
        {
            "loc": {
                "end": {
                    "column": 3,
                    "line": 2
                },
                "start": {
                    "column": 0,
                    "line": 2
                }
            },
            "range": [
                10,
                13
            ],
            "type": "Identifier",
            "value": "foo"
        },
        {
            "loc": {
                "end": {
                    "column": 4,
                    "line": 2
                },
                "start": {
                    "column": 3,
                    "line": 2
                }
            },
            "range": [
                13,
                14
            ],
            "type": "Punctuator",
            "value": "<"
        },
        {
            "loc": {
                "end": {
                    "column": 10,
                    "line": 2
                },
                "start": {
                    "column": 4,
                    "line": 2
                }
            },
            "range": [
                14,
                20
            ],
            "type": "Identifier",
            "value": "number"
        },
        {
            "loc": {
                "end": {
                    "column": 11,
                    "line": 2
                },
                "start": {
                    "column": 10,
                    "line": 2
                }
            },
            "range": [
                20,
                21
            ],
            "type": "Punctuator",
            "value": ">"
        },
        {
            "loc": {
                "end": {
                    "column": 12,
                    "line": 2
                },
                "start": {
                    "column": 11,
                    "line": 2
                }
            },
            "range": [
                21,
                22
            ],
            "type": "Punctuator",
            "value": "("
        },
        {
            "loc": {
                "end": {
                    "column": 13,
                    "line": 2
                },
                "start": {
                    "column": 12,
                    "line": 2
                }
            },
            "range": [
                22,
                23
            ],
            "type": "Punctuator",
            "value": ")"
        },
        {
            "loc": {
                "end": {
                    "column": 14,
                    "line": 2
                },
                "start": {
                    "column": 13,
                    "line": 2
                }
            },
            "range": [
                23,
                24
            ],
            "type": "Punctuator",
            "value": ";"
        }
    ]
};
