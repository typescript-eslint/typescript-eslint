module.exports = {
    "type": "Program",
    "range": [
        0,
        69
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
            "type": "FunctionDeclaration",
            "range": [
                0,
                69
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
            "id": {
                "type": "Identifier",
                "range": [
                    15,
                    18
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 15
                    },
                    "end": {
                        "line": 1,
                        "column": 18
                    }
                },
                "name": "foo"
            },
            "generator": false,
            "expression": false,
            "async": true,
            "params": [],
            "body": {
                "type": "BlockStatement",
                "range": [
                    21,
                    69
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 21
                    },
                    "end": {
                        "line": 5,
                        "column": 1
                    }
                },
                "body": [
                    {
                        "type": "ForOfStatement",
                        "range": [
                            27,
                            67
                        ],
                        "loc": {
                            "start": {
                                "line": 2,
                                "column": 4
                            },
                            "end": {
                                "line": 4,
                                "column": 5
                            }
                        },
                        "left": {
                            "type": "VariableDeclaration",
                            "range": [
                                38,
                                48
                            ],
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 15
                                },
                                "end": {
                                    "line": 2,
                                    "column": 25
                                }
                            },
                            "declarations": [
                                {
                                    "type": "VariableDeclarator",
                                    "range": [
                                        44,
                                        48
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 2,
                                            "column": 21
                                        },
                                        "end": {
                                            "line": 2,
                                            "column": 25
                                        }
                                    },
                                    "id": {
                                        "type": "Identifier",
                                        "range": [
                                            44,
                                            48
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 2,
                                                "column": 21
                                            },
                                            "end": {
                                                "line": 2,
                                                "column": 25
                                            }
                                        },
                                        "name": "item"
                                    },
                                    "init": null
                                }
                            ],
                            "kind": "const"
                        },
                        "right": {
                            "type": "Identifier",
                            "range": [
                                52,
                                57
                            ],
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 29
                                },
                                "end": {
                                    "line": 2,
                                    "column": 34
                                }
                            },
                            "name": "items"
                        },
                        "body": {
                            "type": "BlockStatement",
                            "range": [
                                59,
                                67
                            ],
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 36
                                },
                                "end": {
                                    "line": 4,
                                    "column": 5
                                }
                            },
                            "body": []
                        },
                        "await": true
                    }
                ]
            }
        }
    ],
    "sourceType": "script",
    "tokens": [
        {
            "type": "Identifier",
            "value": "async",
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
            "type": "Keyword",
            "value": "function",
            "range": [
                6,
                14
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 6
                },
                "end": {
                    "line": 1,
                    "column": 14
                }
            }
        },
        {
            "type": "Identifier",
            "value": "foo",
            "range": [
                15,
                18
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 15
                },
                "end": {
                    "line": 1,
                    "column": 18
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                18,
                19
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 18
                },
                "end": {
                    "line": 1,
                    "column": 19
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                19,
                20
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 19
                },
                "end": {
                    "line": 1,
                    "column": 20
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                21,
                22
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 21
                },
                "end": {
                    "line": 1,
                    "column": 22
                }
            }
        },
        {
            "type": "Keyword",
            "value": "for",
            "range": [
                27,
                30
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 4
                },
                "end": {
                    "line": 2,
                    "column": 7
                }
            }
        },
        {
            "type": "Identifier",
            "value": "await",
            "range": [
                31,
                36
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 8
                },
                "end": {
                    "line": 2,
                    "column": 13
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                37,
                38
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 14
                },
                "end": {
                    "line": 2,
                    "column": 15
                }
            }
        },
        {
            "type": "Keyword",
            "value": "const",
            "range": [
                38,
                43
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 15
                },
                "end": {
                    "line": 2,
                    "column": 20
                }
            }
        },
        {
            "type": "Identifier",
            "value": "item",
            "range": [
                44,
                48
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 21
                },
                "end": {
                    "line": 2,
                    "column": 25
                }
            }
        },
        {
            "type": "Identifier",
            "value": "of",
            "range": [
                49,
                51
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 26
                },
                "end": {
                    "line": 2,
                    "column": 28
                }
            }
        },
        {
            "type": "Identifier",
            "value": "items",
            "range": [
                52,
                57
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 29
                },
                "end": {
                    "line": 2,
                    "column": 34
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                57,
                58
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 34
                },
                "end": {
                    "line": 2,
                    "column": 35
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                59,
                60
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 36
                },
                "end": {
                    "line": 2,
                    "column": 37
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                66,
                67
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
            "value": "}",
            "range": [
                68,
                69
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
    ]
};
