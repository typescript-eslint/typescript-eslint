module.exports = {
    "type": "Program",
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
            "column": 1
        }
    },
    "body": [
        {
            "type": "TSInterfaceDeclaration",
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
                    "column": 1
                }
            },
            "typeParameters": {
                "type": "TypeParameterDeclaration",
                "range": [
                    13,
                    16
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 13
                    },
                    "end": {
                        "line": 1,
                        "column": 16
                    }
                },
                "params": [
                    {
                        "type": "TypeParameter",
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
                        },
                        "name": "T",
                        "constraint": null
                    }
                ]
            },
            "body": {
                "type": "TSInterfaceBody",
                "body": [],
                "range": [
                    32,
                    36
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 32
                    },
                    "end": {
                        "line": 3,
                        "column": 1
                    }
                }
            },
            "id": {
                "type": "Identifier",
                "range": [
                    10,
                    13
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 10
                    },
                    "end": {
                        "line": 1,
                        "column": 13
                    }
                },
                "name": "Foo"
            },
            "heritage": [
                {
                    "type": "TSInterfaceHeritage",
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 25
                        },
                        "end": {
                            "line": 1,
                            "column": 28
                        }
                    },
                    "range": [
                        25,
                        28
                    ],
                    "id": {
                        "type": "Identifier",
                        "range": [
                            25,
                            28
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 25
                            },
                            "end": {
                                "line": 1,
                                "column": 28
                            }
                        },
                        "name": "Bar"
                    },
                    "typeParameters": {
                        "type": "TypeParameterInstantiation",
                        "range": [
                            28,
                            31
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 28
                            },
                            "end": {
                                "line": 1,
                                "column": 31
                            }
                        },
                        "params": [
                            {
                                "type": "GenericTypeAnnotation",
                                "range": [
                                    29,
                                    30
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 29
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 30
                                    }
                                },
                                "id": {
                                    "type": "Identifier",
                                    "range": [
                                        29,
                                        30
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 1,
                                            "column": 29
                                        },
                                        "end": {
                                            "line": 1,
                                            "column": 30
                                        }
                                    },
                                    "name": "J"
                                },
                                "typeParameters": null
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
            "value": "interface",
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
            }
        },
        {
            "type": "Identifier",
            "value": "Foo",
            "range": [
                10,
                13
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 10
                },
                "end": {
                    "line": 1,
                    "column": 13
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "<",
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
            "type": "Identifier",
            "value": "T",
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
        },
        {
            "type": "Punctuator",
            "value": ">",
            "range": [
                15,
                16
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 15
                },
                "end": {
                    "line": 1,
                    "column": 16
                }
            }
        },
        {
            "type": "Keyword",
            "value": "extends",
            "range": [
                17,
                24
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 17
                },
                "end": {
                    "line": 1,
                    "column": 24
                }
            }
        },
        {
            "type": "Identifier",
            "value": "Bar",
            "range": [
                25,
                28
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 25
                },
                "end": {
                    "line": 1,
                    "column": 28
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "<",
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
            "type": "Identifier",
            "value": "J",
            "range": [
                29,
                30
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 29
                },
                "end": {
                    "line": 1,
                    "column": 30
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ">",
            "range": [
                30,
                31
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 30
                },
                "end": {
                    "line": 1,
                    "column": 31
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                32,
                33
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 32
                },
                "end": {
                    "line": 1,
                    "column": 33
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                35,
                36
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
