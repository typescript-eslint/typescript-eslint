module.exports = {
    "type": "Program",
    "body": [
        {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "foo",
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
                    "init": null,
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
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "get",
                        "range": [
                            13,
                            16
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
                    "init": null,
                    "range": [
                        13,
                        16
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
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "set",
                        "range": [
                            22,
                            25
                        ],
                        "loc": {
                            "start": {
                                "line": 3,
                                "column": 4
                            },
                            "end": {
                                "line": 3,
                                "column": 7
                            }
                        }
                    },
                    "init": null,
                    "range": [
                        22,
                        25
                    ],
                    "loc": {
                        "start": {
                            "line": 3,
                            "column": 4
                        },
                        "end": {
                            "line": 3,
                            "column": 7
                        }
                    }
                }
            ],
            "kind": "var",
            "range": [
                0,
                26
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 3,
                    "column": 8
                }
            }
        },
        {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "x",
                        "range": [
                            32,
                            33
                        ],
                        "loc": {
                            "start": {
                                "line": 5,
                                "column": 4
                            },
                            "end": {
                                "line": 5,
                                "column": 5
                            }
                        }
                    },
                    "init": {
                        "type": "ObjectExpression",
                        "properties": [
                            {
                                "type": "Property",
                                "key": {
                                    "type": "Identifier",
                                    "name": "foo",
                                    "range": [
                                        42,
                                        45
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 6,
                                            "column": 4
                                        },
                                        "end": {
                                            "line": 6,
                                            "column": 7
                                        }
                                    }
                                },
                                "value": {
                                    "type": "Identifier",
                                    "name": "foo",
                                    "range": [
                                        42,
                                        45
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 6,
                                            "column": 4
                                        },
                                        "end": {
                                            "line": 6,
                                            "column": 7
                                        }
                                    }
                                },
                                "kind": "init",
                                "method": false,
                                "shorthand": true,
                                "computed": false,
                                "range": [
                                    42,
                                    45
                                ],
                                "loc": {
                                    "start": {
                                        "line": 6,
                                        "column": 4
                                    },
                                    "end": {
                                        "line": 6,
                                        "column": 7
                                    }
                                }
                            },
                            {
                                "type": "Property",
                                "key": {
                                    "type": "Identifier",
                                    "name": "get",
                                    "range": [
                                        51,
                                        54
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 7,
                                            "column": 4
                                        },
                                        "end": {
                                            "line": 7,
                                            "column": 7
                                        }
                                    }
                                },
                                "value": {
                                    "type": "Identifier",
                                    "name": "get",
                                    "range": [
                                        51,
                                        54
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 7,
                                            "column": 4
                                        },
                                        "end": {
                                            "line": 7,
                                            "column": 7
                                        }
                                    }
                                },
                                "kind": "init",
                                "method": false,
                                "shorthand": true,
                                "computed": false,
                                "range": [
                                    51,
                                    54
                                ],
                                "loc": {
                                    "start": {
                                        "line": 7,
                                        "column": 4
                                    },
                                    "end": {
                                        "line": 7,
                                        "column": 7
                                    }
                                }
                            },
                            {
                                "type": "ExperimentalSpreadProperty",
                                "argument": {
                                    "type": "Identifier",
                                    "name": "set",
                                    "range": [
                                        63,
                                        66
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 8,
                                            "column": 7
                                        },
                                        "end": {
                                            "line": 8,
                                            "column": 10
                                        }
                                    }
                                },
                                "range": [
                                    60,
                                    66
                                ],
                                "loc": {
                                    "start": {
                                        "line": 8,
                                        "column": 4
                                    },
                                    "end": {
                                        "line": 8,
                                        "column": 10
                                    }
                                }
                            }
                        ],
                        "range": [
                            36,
                            68
                        ],
                        "loc": {
                            "start": {
                                "line": 5,
                                "column": 8
                            },
                            "end": {
                                "line": 9,
                                "column": 1
                            }
                        }
                    },
                    "range": [
                        32,
                        68
                    ],
                    "loc": {
                        "start": {
                            "line": 5,
                            "column": 4
                        },
                        "end": {
                            "line": 9,
                            "column": 1
                        }
                    }
                }
            ],
            "kind": "var",
            "range": [
                28,
                69
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 0
                },
                "end": {
                    "line": 9,
                    "column": 2
                }
            }
        }
    ],
    "sourceType": "script",
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
            "line": 9,
            "column": 2
        }
    },
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
            "value": ",",
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
            "value": "get",
            "range": [
                13,
                16
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
            "type": "Punctuator",
            "value": ",",
            "range": [
                16,
                17
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 7
                },
                "end": {
                    "line": 2,
                    "column": 8
                }
            }
        },
        {
            "type": "Identifier",
            "value": "set",
            "range": [
                22,
                25
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 4
                },
                "end": {
                    "line": 3,
                    "column": 7
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ";",
            "range": [
                25,
                26
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 7
                },
                "end": {
                    "line": 3,
                    "column": 8
                }
            }
        },
        {
            "type": "Keyword",
            "value": "var",
            "range": [
                28,
                31
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 0
                },
                "end": {
                    "line": 5,
                    "column": 3
                }
            }
        },
        {
            "type": "Identifier",
            "value": "x",
            "range": [
                32,
                33
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 4
                },
                "end": {
                    "line": 5,
                    "column": 5
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "=",
            "range": [
                34,
                35
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 6
                },
                "end": {
                    "line": 5,
                    "column": 7
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                36,
                37
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 8
                },
                "end": {
                    "line": 5,
                    "column": 9
                }
            }
        },
        {
            "type": "Identifier",
            "value": "foo",
            "range": [
                42,
                45
            ],
            "loc": {
                "start": {
                    "line": 6,
                    "column": 4
                },
                "end": {
                    "line": 6,
                    "column": 7
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ",",
            "range": [
                45,
                46
            ],
            "loc": {
                "start": {
                    "line": 6,
                    "column": 7
                },
                "end": {
                    "line": 6,
                    "column": 8
                }
            }
        },
        {
            "type": "Identifier",
            "value": "get",
            "range": [
                51,
                54
            ],
            "loc": {
                "start": {
                    "line": 7,
                    "column": 4
                },
                "end": {
                    "line": 7,
                    "column": 7
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ",",
            "range": [
                54,
                55
            ],
            "loc": {
                "start": {
                    "line": 7,
                    "column": 7
                },
                "end": {
                    "line": 7,
                    "column": 8
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "...",
            "range": [
                60,
                63
            ],
            "loc": {
                "start": {
                    "line": 8,
                    "column": 4
                },
                "end": {
                    "line": 8,
                    "column": 7
                }
            }
        },
        {
            "type": "Identifier",
            "value": "set",
            "range": [
                63,
                66
            ],
            "loc": {
                "start": {
                    "line": 8,
                    "column": 7
                },
                "end": {
                    "line": 8,
                    "column": 10
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                67,
                68
            ],
            "loc": {
                "start": {
                    "line": 9,
                    "column": 0
                },
                "end": {
                    "line": 9,
                    "column": 1
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ";",
            "range": [
                68,
                69
            ],
            "loc": {
                "start": {
                    "line": 9,
                    "column": 1
                },
                "end": {
                    "line": 9,
                    "column": 2
                }
            }
        }
    ]
};