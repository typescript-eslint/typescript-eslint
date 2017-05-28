module.exports = {
    "type": "Program",
    "range": [
        0,
        58
    ],
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 4,
            "column": 21
        }
    },
    "body": [
        {
            "type": "ClassDeclaration",
            "range": [
                0,
                58
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 4,
                    "column": 21
                }
            },
            "id": {
                "type": "Identifier",
                "range": [
                    43,
                    55
                ],
                "loc": {
                    "start": {
                        "line": 4,
                        "column": 6
                    },
                    "end": {
                        "line": 4,
                        "column": 18
                    }
                },
                "name": "FooComponent"
            },
            "body": {
                "type": "ClassBody",
                "body": [],
                "range": [
                    56,
                    58
                ],
                "loc": {
                    "start": {
                        "line": 4,
                        "column": 19
                    },
                    "end": {
                        "line": 4,
                        "column": 21
                    }
                }
            },
            "superClass": null,
            "implements": [],
            "decorators": [
                {
                    "type": "Decorator",
                    "range": [
                        0,
                        36
                    ],
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 0
                        },
                        "end": {
                            "line": 3,
                            "column": 2
                        }
                    },
                    "expression": {
                        "type": "CallExpression",
                        "range": [
                            1,
                            36
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 1
                            },
                            "end": {
                                "line": 3,
                                "column": 2
                            }
                        },
                        "callee": {
                            "type": "Identifier",
                            "range": [
                                1,
                                10
                            ],
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 1
                                },
                                "end": {
                                    "line": 1,
                                    "column": 10
                                }
                            },
                            "name": "Component"
                        },
                        "arguments": [
                            {
                                "type": "ObjectExpression",
                                "range": [
                                    11,
                                    35
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 11
                                    },
                                    "end": {
                                        "line": 3,
                                        "column": 1
                                    }
                                },
                                "properties": [
                                    {
                                        "type": "Property",
                                        "range": [
                                            17,
                                            32
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 2,
                                                "column": 4
                                            },
                                            "end": {
                                                "line": 2,
                                                "column": 19
                                            }
                                        },
                                        "key": {
                                            "type": "Identifier",
                                            "range": [
                                                17,
                                                25
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 2,
                                                    "column": 4
                                                },
                                                "end": {
                                                    "line": 2,
                                                    "column": 12
                                                }
                                            },
                                            "name": "selector"
                                        },
                                        "value": {
                                            "type": "Literal",
                                            "range": [
                                                27,
                                                32
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 2,
                                                    "column": 14
                                                },
                                                "end": {
                                                    "line": 2,
                                                    "column": 19
                                                }
                                            },
                                            "value": "foo",
                                            "raw": "'foo'"
                                        },
                                        "computed": false,
                                        "method": false,
                                        "shorthand": false,
                                        "kind": "init"
                                    }
                                ]
                            }
                        ]
                    }
                }
            ]
        }
    ],
    "sourceType": "script",
    "tokens": [
        {
            "type": "Punctuator",
            "value": "@",
            "range": [
                0,
                1
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 1
                }
            }
        },
        {
            "type": "Identifier",
            "value": "Component",
            "range": [
                1,
                10
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 1
                },
                "end": {
                    "line": 1,
                    "column": 10
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                10,
                11
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 10
                },
                "end": {
                    "line": 1,
                    "column": 11
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
                    "line": 1,
                    "column": 11
                },
                "end": {
                    "line": 1,
                    "column": 12
                }
            }
        },
        {
            "type": "Identifier",
            "value": "selector",
            "range": [
                17,
                25
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 4
                },
                "end": {
                    "line": 2,
                    "column": 12
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ":",
            "range": [
                25,
                26
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 12
                },
                "end": {
                    "line": 2,
                    "column": 13
                }
            }
        },
        {
            "type": "String",
            "value": "'foo'",
            "range": [
                27,
                32
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 14
                },
                "end": {
                    "line": 2,
                    "column": 19
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ",",
            "range": [
                32,
                33
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 19
                },
                "end": {
                    "line": 2,
                    "column": 20
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                34,
                35
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
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                35,
                36
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 1
                },
                "end": {
                    "line": 3,
                    "column": 2
                }
            }
        },
        {
            "type": "Keyword",
            "value": "class",
            "range": [
                37,
                42
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 0
                },
                "end": {
                    "line": 4,
                    "column": 5
                }
            }
        },
        {
            "type": "Identifier",
            "value": "FooComponent",
            "range": [
                43,
                55
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 6
                },
                "end": {
                    "line": 4,
                    "column": 18
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                56,
                57
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 19
                },
                "end": {
                    "line": 4,
                    "column": 20
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                57,
                58
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 20
                },
                "end": {
                    "line": 4,
                    "column": 21
                }
            }
        }
    ]
};