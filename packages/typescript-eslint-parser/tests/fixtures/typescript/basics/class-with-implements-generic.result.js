module.exports = {
    "type": "Program",
    "range": [
        0,
        32
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
                32
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
            "decorators": [],
            "id": {
                "type": "Identifier",
                "range": [
                    6,
                    9
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 6
                    },
                    "end": {
                        "line": 1,
                        "column": 9
                    }
                },
                "name": "Foo"
            },
            "body": {
                "type": "ClassBody",
                "body": [],
                "range": [
                    28,
                    32
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 28
                    },
                    "end": {
                        "line": 3,
                        "column": 1
                    }
                }
            },
            "superClass": null,
            "implements": [
                {
                    "type": "ClassImplements",
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 21
                        },
                        "end": {
                            "line": 1,
                            "column": 24
                        }
                    },
                    "range": [
                        21,
                        24
                    ],
                    "id": {
                        "type": "Identifier",
                        "range": [
                            21,
                            24
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 21
                            },
                            "end": {
                                "line": 1,
                                "column": 24
                            }
                        },
                        "name": "Bar"
                    },
                    "typeParameters": {
                        "type": "TypeParameterInstantiation",
                        "range": [
                            24,
                            27
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 24
                            },
                            "end": {
                                "line": 1,
                                "column": 27
                            }
                        },
                        "params": [
                            {
                                "type": "GenericTypeAnnotation",
                                "range": [
                                    25,
                                    26
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 25
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 26
                                    }
                                },
                                "id": {
                                    "type": "Identifier",
                                    "range": [
                                        25,
                                        26
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 1,
                                            "column": 25
                                        },
                                        "end": {
                                            "line": 1,
                                            "column": 26
                                        }
                                    },
                                    "name": "S"
                                }
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
            "value": "Foo",
            "range": [
                6,
                9
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 6
                },
                "end": {
                    "line": 1,
                    "column": 9
                }
            }
        },
        {
            "type": "Keyword",
            "value": "implements",
            "range": [
                10,
                20
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 10
                },
                "end": {
                    "line": 1,
                    "column": 20
                }
            }
        },
        {
            "type": "Identifier",
            "value": "Bar",
            "range": [
                21,
                24
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 21
                },
                "end": {
                    "line": 1,
                    "column": 24
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "<",
            "range": [
                24,
                25
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 24
                },
                "end": {
                    "line": 1,
                    "column": 25
                }
            }
        },
        {
            "type": "Identifier",
            "value": "S",
            "range": [
                25,
                26
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 25
                },
                "end": {
                    "line": 1,
                    "column": 26
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ">",
            "range": [
                26,
                27
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 26
                },
                "end": {
                    "line": 1,
                    "column": 27
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                28,
                29
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 28
                },
                "end": {
                    "line": 1,
                    "column": 29
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                31,
                32
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
