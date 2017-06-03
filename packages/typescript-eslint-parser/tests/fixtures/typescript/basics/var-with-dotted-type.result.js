module.exports = {
    "type": "Program",
    "range": [
        0,
        15
    ],
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 1,
            "column": 15
        }
    },
    "body": [
        {
            "type": "VariableDeclaration",
            "range": [
                0,
                15
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 15
                }
            },
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "range": [
                        4,
                        14
                    ],
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 4
                        },
                        "end": {
                            "line": 1,
                            "column": 14
                        }
                    },
                    "id": {
                        "type": "Identifier",
                        "range": [
                            4,
                            7
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 4
                            },
                            "end": {
                                "line": 1,
                                "column": 7
                            }
                        },
                        "name": "foo",
                        "typeAnnotation": {
                            "type": "TypeAnnotation",
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 9
                                },
                                "end": {
                                    "line": 1,
                                    "column": 14
                                }
                            },
                            "range": [
                                9,
                                14
                            ],
                            "typeAnnotation": {
                                "type": "TSTypeReference",
                                "range": [
                                    9,
                                    14
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 9
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 14
                                    }
                                },
                                "typeName": {
                                    "type": "TSQualifiedName",
                                    "range": [
                                        9,
                                        14
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 1,
                                            "column": 9
                                        },
                                        "end": {
                                            "line": 1,
                                            "column": 14
                                        }
                                    },
                                    "left": {
                                        "type": "TSQualifiedName",
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
                                        "left": {
                                            "type": "Identifier",
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
                                            },
                                            "name": "A"
                                        },
                                        "right": {
                                            "type": "Identifier",
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
                                            },
                                            "name": "B"
                                        }
                                    },
                                    "right": {
                                        "type": "Identifier",
                                        "range": [
                                            13,
                                            14
                                        ],
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
                                        "name": "C"
                                    }
                                }
                            }
                        }
                    },
                    "init": null
                }
            ],
            "kind": "var"
        }
    ],
    "sourceType": "script",
    "tokens": [
        {
            "type": "Keyword",
            "value": "var",
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
            "value": "foo",
            "range": [
                4,
                7
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 4
                },
                "end": {
                    "line": 1,
                    "column": 7
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ":",
            "range": [
                7,
                8
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 7
                },
                "end": {
                    "line": 1,
                    "column": 8
                }
            }
        },
        {
            "type": "Identifier",
            "value": "A",
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
            "value": ".",
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
            "type": "Identifier",
            "value": "B",
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
            "type": "Punctuator",
            "value": ".",
            "range": [
                12,
                13
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 12
                },
                "end": {
                    "line": 1,
                    "column": 13
                }
            }
        },
        {
            "type": "Identifier",
            "value": "C",
            "range": [
                13,
                14
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 13
                },
                "end": {
                    "line": 1,
                    "column": 14
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ";",
            "range": [
                14,
                15
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 14
                },
                "end": {
                    "line": 1,
                    "column": 15
                }
            }
        }
    ]
};