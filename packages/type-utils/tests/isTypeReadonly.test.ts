import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { ReadonlynessOptions } from '../src/index.js';

import { isTypeReadonly } from '../src/index.js';

describe(isTypeReadonly, () => {
  describe(AST_NODE_TYPES.TSTypeAliasDeclaration, () => {
    describe('default options', () => {
      const options = undefined;

      describe('basics', () => {
        describe('is readonly', () => {
          // Record.
          it.for([
            ['type Test = { readonly bar: string; };'],
            ['type Test = Readonly<{ bar: string; }>;'],
          ] as const)(
            'handles fully readonly records: %s',
            ([code], { expect }) => {
              expect(code).toBeReadOnly(options);
            },
          );

          // Array.
          it.for([
            ['type Test = Readonly<readonly string[]>;'],
            ['type Test = Readonly<ReadonlyArray<string>>;'],
          ] as const)(
            'handles fully readonly arrays: %s',
            ([code], { expect }) => {
              expect(code).toBeReadOnly(options);
            },
          );

          // Array - special case.
          // Note: Methods are mutable but arrays are treated special; hence no failure.
          it.for([
            ['type Test = readonly string[];'],
            ['type Test = ReadonlyArray<string>;'],
          ] as const)(
            'treats readonly arrays as fully readonly: %s',
            ([code], { expect }) => {
              expect(code).toBeReadOnly(options);
            },
          );

          // Set and Map.
          it.for([
            ['type Test = Readonly<ReadonlySet<string>>;'],
            ['type Test = Readonly<ReadonlyMap<string, string>>;'],
          ] as const)(
            'handles fully readonly sets and maps: %s',
            ([code], { expect }) => {
              expect(code).toBeReadOnly(options);
            },
          );

          // Private Identifier.
          // Note: It can't be accessed from outside of class thus exempt from the checks.
          it.for([
            ['class Foo { readonly #readonlyPrivateField = "foo"; }'],
            ['class Foo { #privateField = "foo"; }'],
            ['class Foo { #privateMember() {}; }'],
          ] as const)(
            'treat private identifier as readonly: %s',
            ([code], { expect }) => {
              expect(code).toBeReadOnly(options);
            },
          );
        });

        describe('is not readonly', () => {
          // Record.
          it.for([
            ['type Test = { foo: string; };'],
            ['type Test = { foo: string; readonly bar: number; };'],
          ] as const)(
            'handles non fully readonly records: %s',
            ([code], { expect }) => {
              expect(code).not.toBeReadOnly(options);
            },
          );

          // Array.
          it.for([
            ['type Test = string[]'],
            ['type Test = Array<string>'],
          ] as const)(
            'handles non fully readonly arrays: %s',
            ([code], { expect }) => {
              expect(code).not.toBeReadOnly(options);
            },
          );

          // Set and Map.
          // Note: Methods are mutable for ReadonlySet and ReadonlyMet; hence failure.
          it.for([
            ['type Test = Set<string>;'],
            ['type Test = Map<string, string>;'],
            ['type Test = ReadonlySet<string>;'],
            ['type Test = ReadonlyMap<string, string>;'],
          ] as const)(
            'handles non fully readonly sets and maps: %s',
            ([code], { expect }) => {
              expect(code).not.toBeReadOnly(options);
            },
          );
        });
      });

      describe('IndexSignature', () => {
        describe('is readonly', () => {
          it.for([
            ['type Test = { readonly [key: string]: string };'],
            [
              'type Test = { readonly [key: string]: { readonly foo: readonly string[]; }; };',
            ],
          ] as const)(
            'handles readonly PropertySignature inside a readonly IndexSignature: %s',
            ([code], { expect }) => {
              expect(code).toBeReadOnly(options);
            },
          );
        });

        describe('is readonly circular', () => {
          it('handles circular readonly PropertySignature inside a readonly IndexSignature', () => {
            expect(
              'interface Test { readonly [key: string]: Test };',
            ).toBeReadOnly(options);
          });

          it('handles circular readonly PropertySignature inside interdependent objects', () => {
            expect(
              'interface Test1 { readonly [key: string]: Test } interface Test { readonly [key: string]: Test1 }',
            ).toBeReadOnly(options);
          });
        });

        describe('is not readonly', () => {
          it.for([
            ['type Test = { [key: string]: string };'],
            ['type Test = { readonly [key: string]: { foo: string[]; }; };'],
          ] as const)(
            'handles mutable PropertySignature inside a readonly IndexSignature: %s',
            ([code], { expect }) => {
              expect(code).not.toBeReadOnly(options);
            },
          );
        });

        describe('is not readonly circular', () => {
          it('handles circular mutable PropertySignature', () => {
            expect('interface Test { [key: string]: Test };').not.toBeReadOnly(
              options,
            );
          });

          it.for([
            [
              'interface Test1 { [key: string]: Test } interface Test { readonly [key: string]: Test1 }',
            ],
            [
              'interface Test1 { readonly [key: string]: Test } interface Test { [key: string]: Test1 }',
            ],
            [
              'interface Test1 { [key: string]: Test } interface Test { [key: string]: Test1 }',
            ],
          ] as const)(
            'handles circular mutable PropertySignature inside interdependent objects: %s',
            ([code], { expect }) => {
              expect(code).not.toBeReadOnly(options);
            },
          );
        });
      });

      describe('Union', () => {
        describe('is readonly', () => {
          it.for([
            [
              'type Test = Readonly<{ foo: string; bar: number; }> & Readonly<{ bar: number; }>;',
            ],
            ['type Test = readonly string[] | readonly number[];'],
          ] as const)(
            'handles a union of 2 fully readonly types: %s',
            ([code], { expect }) => {
              expect(code).toBeReadOnly(options);
            },
          );
        });

        describe('is not readonly', () => {
          it.for([
            ['type Test = { foo: string; bar: number; } | { bar: number; };'],
            [
              'type Test = { foo: string; bar: number; } | Readonly<{ bar: number; }>;',
            ],
            [
              'type Test = Readonly<{ foo: string; bar: number; }> | { bar: number; };',
            ],
          ] as const)(
            'handles a union of non fully readonly types: %s',
            ([code], { expect }) => {
              expect(code).not.toBeReadOnly(options);
            },
          );
        });
      });

      describe('Intersection', () => {
        describe('is readonly', () => {
          it.for([
            [
              'type Test = Readonly<{ foo: string; bar: number; }> & Readonly<{ bar: number; }>;',
            ],
          ] as const)(
            'handles an intersection of 2 fully readonly types: %s',
            ([code], { expect }) => {
              expect(code).toBeReadOnly(options);
            },
          );

          it.for([
            [
              'type Test = Readonly<{ foo: string; bar: number; }> & { foo: string; };',
            ],
          ] as const)(
            'handles an intersection of a fully readonly type with a mutable subtype: %s',
            ([code], { expect }) => {
              expect(code).toBeReadOnly(options);
            },
          );

          // Array - special case.
          // Note: Methods are mutable but arrays are treated special; hence no failure.
          it.for([
            ['type Test = ReadonlyArray<string> & Readonly<{ foo: string; }>;'],
            [
              'type Test = readonly [string, number] & Readonly<{ foo: string; }>;',
            ],
          ] as const)(
            'handles an intersections involving a readonly array: %s',
            ([code], { expect }) => {
              expect(code).toBeReadOnly(options);
            },
          );
        });

        describe('is not readonly', () => {
          it.for([
            ['type Test = { foo: string; bar: number; } & { bar: number; };'],
            [
              'type Test = { foo: string; bar: number; } & Readonly<{ bar: number; }>;',
            ],
            [
              'type Test = Readonly<{ bar: number; }> & { foo: string; bar: number; };',
            ],
          ] as const)(
            'handles an intersection of non fully readonly types: %s',
            ([code], { expect }) => {
              expect(code).not.toBeReadOnly(options);
            },
          );
        });
      });

      describe('Conditional Types', () => {
        describe('is readonly', () => {
          it.for([
            [
              'type Test<T> = T extends readonly number[] ? readonly string[] : readonly number[];',
            ],
          ] as const)(
            'handles conditional type that are fully readonly: %s',
            ([code], { expect }) => {
              expect(code).toBeReadOnly(options);
            },
          );

          it.for([
            [
              'type Test<T> = T extends number[] ? readonly string[] : readonly number[];',
            ],
          ] as const)(
            'should ignore mutable conditions: %s',
            ([code], { expect }) => {
              expect(code).toBeReadOnly(options);
            },
          );
        });

        describe('is not readonly', () => {
          it.for([
            ['type Test<T> = T extends number[] ? string[] : number[];'],
            [
              'type Test<T> = T extends number[] ? string[] : readonly number[];',
            ],
            [
              'type Test<T> = T extends number[] ? readonly string[] : number[];',
            ],
          ] as const)(
            'handles non fully readonly conditional types: %s',
            ([code], { expect }) => {
              expect(code).not.toBeReadOnly(options);
            },
          );
        });
      });
    });

    describe('treatMethodsAsReadonly', () => {
      const options: ReadonlynessOptions = {
        treatMethodsAsReadonly: true,
      };

      describe('is readonly', () => {
        // Set and Map.
        it.for([
          ['type Test = ReadonlySet<string>;'],
          ['type Test = ReadonlyMap<string, string>;'],
        ] as const)(
          'handles non fully readonly sets and maps: %s',
          ([code], { expect }) => {
            expect(code).toBeReadOnly(options);
          },
        );
      });
    });

    describe('allowlist', () => {
      const options: ReadonlynessOptions = {
        allow: [
          {
            from: 'lib',
            name: 'RegExp',
          },
          {
            from: 'file',
            name: 'Foo',
          },
        ],
      };

      describe('is readonly', () => {
        it.for([
          [
            'interface Foo {readonly prop: RegExp}; type Test = (arg: Foo) => void;',
          ],
          [
            'interface Foo {prop: RegExp}; type Test = (arg: Readonly<Foo>) => void;',
          ],
          ['interface Foo {prop: string}; type Test = (arg: Foo) => void;'],
        ] as const)(
          'correctly marks allowlisted types as readonly: %s',
          ([code], { expect }) => {
            expect(code).toBeReadOnly(options);
          },
        );
      });

      describe('is not readonly', () => {
        it.for([
          [
            'interface Bar {prop: RegExp}; type Test = (arg: Readonly<Bar>) => void;',
          ],
          ['interface Bar {prop: string}; type Test = (arg: Bar) => void;'],
        ] as const)(
          'correctly marks allowlisted types as readonly: %s',
          ([code], { expect }) => {
            expect(code).not.toBeReadOnly(options);
          },
        );
      });
    });

    describe('type alias name matching', () => {
      const options: ReadonlynessOptions = {
        allow: [{ from: 'file', name: 'MyMutableType' }],
      };

      describe('is readonly', () => {
        it.for([
          ['type MyMutableType = { prop: string }; type Test = MyMutableType;'],
        ] as const)(
          'treats type aliases in allow list as readonly: %s',
          ([code], { expect }) => {
            expect(code).toBeReadOnly(options);
          },
        );
      });

      describe('is not readonly', () => {
        it.for([
          ['type OtherType = { prop: string }; type Test = OtherType;'],
        ] as const)(
          'checks structure when type alias not in allow list: %s',
          ([code], { expect }) => {
            expect(code).not.toBeReadOnly(options);
          },
        );
      });
    });

    describe('string format allow specifier', () => {
      const options: ReadonlynessOptions = {
        allow: ['StringFormatType'],
      };

      describe('is readonly', () => {
        it.for([
          [
            'type StringFormatType = { prop: string }; type Test = StringFormatType;',
          ],
        ] as const)(
          'handles string format allow specifier: %s',
          ([code], { expect }) => {
            expect(code).toBeReadOnly(options);
          },
        );
      });
    });

    describe('array format name in allow specifier', () => {
      const options: ReadonlynessOptions = {
        allow: [{ from: 'file', name: ['Type1', 'Type2'] }],
      };

      describe('is readonly', () => {
        it.for([
          ['type Type1 = { prop: string }; type Test = Type1;'],
          ['type Type2 = { prop: string }; type Test = Type2;'],
        ] as const)('handles array format name: %s', ([code], { expect }) => {
          expect(code).toBeReadOnly(options);
        });
      });
    });
  });
});
