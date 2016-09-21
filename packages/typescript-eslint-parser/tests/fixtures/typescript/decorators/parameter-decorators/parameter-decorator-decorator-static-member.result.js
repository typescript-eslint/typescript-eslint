module.exports = {
    "type": "Program",
    "range": [
        0,
        65
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
            "type": "ClassDeclaration",
            "range": [
                0,
                65
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
            "id": {
                "type": "Identifier",
                "range": [
                    6,
                    15
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 6
                    },
                    "end": {
                        "line": 1,
                        "column": 15
                    }
                },
                "name": "StaticFoo"
            },
            "body": {
                "type": "ClassBody",
                "body": [
                    {
                        "type": "MethodDefinition",
                        "range": [
                            22,
                            63
                        ],
                        "loc": {
                            "start": {
                                "line": 2,
                                "column": 4
                            },
                            "end": {
                                "line": 2,
                                "column": 45
                            }
                        },
                        "key": {
                            "type": "Identifier",
                            "range": [
                                29,
                                32
                            ],
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
                            "name": "bar"
                        },
                        "value": {
                            "type": "FunctionExpression",
                            "id": null,
                            "generator": false,
                            "expression": false,
                            "body": {
                                "type": "BlockStatement",
                                "range": [
                                    61,
                                    63
                                ],
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 43
                                    },
                                    "end": {
                                        "line": 2,
                                        "column": 45
                                    }
                                },
                                "body": []
                            },
                            "range": [
                                32,
                                63
                            ],
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 14
                                },
                                "end": {
                                    "line": 2,
                                    "column": 45
                                }
                            },
                            "params": [
                                {
                                    "type": "Identifier",
                                    "range": [
                                        48,
                                        51
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 2,
                                            "column": 30
                                        },
                                        "end": {
                                            "line": 2,
                                            "column": 33
                                        }
                                    },
                                    "name": "baz",
                                    "decorators": [
                                        {
                                            "type": "CallExpression",
                                            "range": [
                                                34,
                                                47
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 2,
                                                    "column": 16
                                                },
                                                "end": {
                                                    "line": 2,
                                                    "column": 29
                                                }
                                            },
                                            "callee": {
                                                "type": "Identifier",
                                                "range": [
                                                    34,
                                                    41
                                                ],
                                                "loc": {
                                                    "start": {
                                                        "line": 2,
                                                        "column": 16
                                                    },
                                                    "end": {
                                                        "line": 2,
                                                        "column": 23
                                                    }
                                                },
                                                "name": "special"
                                            },
                                            "arguments": [
                                                {
                                                    "type": "Literal",
                                                    "range": [
                                                        42,
                                                        46
                                                    ],
                                                    "loc": {
                                                        "start": {
                                                            "line": 2,
                                                            "column": 24
                                                        },
                                                        "end": {
                                                            "line": 2,
                                                            "column": 28
                                                        }
                                                    },
                                                    "value": true,
                                                    "raw": "true"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        "computed": false,
                        "static": true,
                        "kind": "method",
                        "accessibility": null,
                        "decorators": []
                    }
                ],
                "range": [
                    16,
                    65
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 16
                    },
                    "end": {
                        "line": 3,
                        "column": 1
                    }
                }
            },
            "superClass": null,
            "implements": [],
            "decorators": []
        }
    ],
    "sourceType": "script",
    "tokens": [
        {
            "type": "Keyword",
            "value": "class",
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
            "type": "Identifier",
            "value": "StaticFoo",
            "range": [
                6,
                15
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 6
                },
                "end": {
                    "line": 1,
                    "column": 15
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                16,
                17
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 16
                },
                "end": {
                    "line": 1,
                    "column": 17
                }
            }
        },
        {
            "type": "Keyword",
            "value": "static",
            "range": [
                22,
                28
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
            "type": "Identifier",
            "value": "bar",
            "range": [
                29,
                32
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 11
                },
                "end": {
                    "line": 2,
                    "column": 14
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                32,
                33
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
            "type": "Punctuator",
            "value": "@",
            "range": [
                33,
                34
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 15
                },
                "end": {
                    "line": 2,
                    "column": 16
                }
            }
        },
        {
            "type": "Identifier",
            "value": "special",
            "range": [
                34,
                41
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 16
                },
                "end": {
                    "line": 2,
                    "column": 23
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                41,
                42
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 23
                },
                "end": {
                    "line": 2,
                    "column": 24
                }
            }
        },
        {
            "type": "Boolean",
            "value": "true",
            "range": [
                42,
                46
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 24
                },
                "end": {
                    "line": 2,
                    "column": 28
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                46,
                47
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 28
                },
                "end": {
                    "line": 2,
                    "column": 29
                }
            }
        },
        {
            "type": "Identifier",
            "value": "baz",
            "range": [
                48,
                51
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 30
                },
                "end": {
                    "line": 2,
                    "column": 33
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ":",
            "range": [
                51,
                52
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 33
                },
                "end": {
                    "line": 2,
                    "column": 34
                }
            }
        },
        {
            "type": "Identifier",
            "value": "number",
            "range": [
                53,
                59
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 35
                },
                "end": {
                    "line": 2,
                    "column": 41
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                59,
                60
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 41
                },
                "end": {
                    "line": 2,
                    "column": 42
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                61,
                62
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 43
                },
                "end": {
                    "line": 2,
                    "column": 44
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                62,
                63
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 44
                },
                "end": {
                    "line": 2,
                    "column": 45
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                64,
                65
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