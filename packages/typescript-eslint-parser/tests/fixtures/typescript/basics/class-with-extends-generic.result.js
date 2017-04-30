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
            "typeParameters": {
                "type": "TypeParameterDeclaration",
                "range": [
                    9,
                    12
                ],
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
                "params": [
                    {
                        "type": "TypeParameter",
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
                        },
                        "name": "A",
                        "constraint": null
                    }
                ]
            },
            "superTypeParameters": {
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
                            "name": "B"
                        },
                        "typeParameters": null
                    }
                ]
            },
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
            "superClass": {
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
            "type": "Punctuator",
            "value": "<",
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
            "type": "Identifier",
            "value": "A",
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
            "value": ">",
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
            "type": "Keyword",
            "value": "extends",
            "range": [
                13,
                20
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 13
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
            "value": "B",
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