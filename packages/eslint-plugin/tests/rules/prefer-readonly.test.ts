import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/prefer-readonly';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootDir,
    },
  },
});

ruleTester.run('prefer-readonly', rule, {
  valid: [
    'function ignore() {}',
    'const ignore = function () {};',
    'const ignore = () => {};',
    `
      const container = { member: true };
      container.member;
    `,
    `
      const container = { member: 1 };
      +container.member;
    `,
    `
      const container = { member: 1 };
      ++container.member;
    `,
    `
      const container = { member: 1 };
      container.member++;
    `,
    `
      const container = { member: 1 };
      -container.member;
    `,
    `
      const container = { member: 1 };
      --container.member;
    `,
    `
      const container = { member: 1 };
      container.member--;
    `,
    'class TestEmpty {}',
    `
      class TestReadonlyStatic {
        private static readonly correctlyReadonlyStatic = 7;
      }
    `,
    `
      class TestReadonlyStatic {
        static readonly #correctlyReadonlyStatic = 7;
      }
    `,
    `
      class TestModifiableStatic {
        private static correctlyModifiableStatic = 7;

        public constructor() {
          TestModifiableStatic.correctlyModifiableStatic += 1;
        }
      }
    `,
    `
      class TestModifiableStatic {
        static #correctlyModifiableStatic = 7;

        public constructor() {
          TestModifiableStatic.#correctlyModifiableStatic += 1;
        }
      }
    `,
    `
      class TestModifiableByParameterProperty {
        private static readonly correctlyModifiableByParameterProperty = 7;

        public constructor(
          public correctlyModifiablePublicParameter: number = (() => {
            return (TestModifiableStatic.correctlyModifiableByParameterProperty += 1);
          })(),
        ) {}
      }
    `,
    `
      class TestModifiableByParameterProperty {
        static readonly #correctlyModifiableByParameterProperty = 7;

        public constructor(
          public correctlyModifiablePublicParameter: number = (() => {
            return (TestModifiableStatic.#correctlyModifiableByParameterProperty += 1);
          })(),
        ) {}
      }
    `,
    `
      class TestReadonlyInline {
        private readonly correctlyReadonlyInline = 7;
      }
    `,
    `
      class TestReadonlyInline {
        readonly #correctlyReadonlyInline = 7;
      }
    `,
    `
      class TestReadonlyDelayed {
        private readonly correctlyReadonlyDelayed = 7;

        public constructor() {
          this.correctlyReadonlyDelayed += 1;
        }
      }
    `,
    `
      class TestReadonlyDelayed {
        readonly #correctlyReadonlyDelayed = 7;

        public constructor() {
          this.#correctlyReadonlyDelayed += 1;
        }
      }
    `,
    `
      class TestModifiableInline {
        private correctlyModifiableInline = 7;

        public mutate() {
          this.correctlyModifiableInline += 1;

          return class {
            private correctlyModifiableInline = 7;

            mutate() {
              this.correctlyModifiableInline += 1;
            }
          };
        }
      }
    `,
    `
      class TestModifiableInline {
        #correctlyModifiableInline = 7;

        public mutate() {
          this.#correctlyModifiableInline += 1;

          return class {
            #correctlyModifiableInline = 7;

            mutate() {
              this.#correctlyModifiableInline += 1;
            }
          };
        }
      }
    `,
    `
      class TestModifiableDelayed {
        private correctlyModifiableDelayed = 7;

        public mutate() {
          this.correctlyModifiableDelayed += 1;
        }
      }
    `,
    `
      class TestModifiableDelayed {
        #correctlyModifiableDelayed = 7;

        public mutate() {
          this.#correctlyModifiableDelayed += 1;
        }
      }
    `,
    `
      class TestModifiableDeleted {
        private correctlyModifiableDeleted = 7;

        public mutate() {
          delete this.correctlyModifiableDeleted;
        }
      }
    `,
    `
      class TestModifiableWithinConstructor {
        private correctlyModifiableWithinConstructor = 7;

        public constructor() {
          (() => {
            this.correctlyModifiableWithinConstructor += 1;
          })();
        }
      }
    `,
    `
      class TestModifiableWithinConstructor {
        #correctlyModifiableWithinConstructor = 7;

        public constructor() {
          (() => {
            this.#correctlyModifiableWithinConstructor += 1;
          })();
        }
      }
    `,
    `
      class TestModifiableWithinConstructorArrowFunction {
        private correctlyModifiableWithinConstructorArrowFunction = 7;

        public constructor() {
          (() => {
            this.correctlyModifiableWithinConstructorArrowFunction += 1;
          })();
        }
      }
    `,
    `
      class TestModifiableWithinConstructorArrowFunction {
        #correctlyModifiableWithinConstructorArrowFunction = 7;

        public constructor() {
          (() => {
            this.#correctlyModifiableWithinConstructorArrowFunction += 1;
          })();
        }
      }
    `,
    `
      class TestModifiableWithinConstructorInFunctionExpression {
        private correctlyModifiableWithinConstructorInFunctionExpression = 7;

        public constructor() {
          const self = this;

          (() => {
            self.correctlyModifiableWithinConstructorInFunctionExpression += 1;
          })();
        }
      }
    `,
    `
      class TestModifiableWithinConstructorInFunctionExpression {
        #correctlyModifiableWithinConstructorInFunctionExpression = 7;

        public constructor() {
          const self = this;

          (() => {
            self.#correctlyModifiableWithinConstructorInFunctionExpression += 1;
          })();
        }
      }
    `,
    `
      class TestModifiableWithinConstructorInGetAccessor {
        private correctlyModifiableWithinConstructorInGetAccessor = 7;

        public constructor() {
          const self = this;

          const confusingObject = {
            get accessor() {
              return (self.correctlyModifiableWithinConstructorInGetAccessor += 1);
            },
          };
        }
      }
    `,
    `
      class TestModifiableWithinConstructorInGetAccessor {
        #correctlyModifiableWithinConstructorInGetAccessor = 7;

        public constructor() {
          const self = this;

          const confusingObject = {
            get accessor() {
              return (self.#correctlyModifiableWithinConstructorInGetAccessor += 1);
            },
          };
        }
      }
    `,
    `
      class TestModifiableWithinConstructorInMethodDeclaration {
        private correctlyModifiableWithinConstructorInMethodDeclaration = 7;

        public constructor() {
          const self = this;

          const confusingObject = {
            methodDeclaration() {
              self.correctlyModifiableWithinConstructorInMethodDeclaration = 7;
            },
          };
        }
      }
    `,
    `
      class TestModifiableWithinConstructorInMethodDeclaration {
        #correctlyModifiableWithinConstructorInMethodDeclaration = 7;

        public constructor() {
          const self = this;

          const confusingObject = {
            methodDeclaration() {
              self.#correctlyModifiableWithinConstructorInMethodDeclaration = 7;
            },
          };
        }
      }
    `,
    `
      class TestModifiableWithinConstructorInSetAccessor {
        private correctlyModifiableWithinConstructorInSetAccessor = 7;

        public constructor() {
          const self = this;

          const confusingObject = {
            set accessor(value: number) {
              self.correctlyModifiableWithinConstructorInSetAccessor += value;
            },
          };
        }
      }
    `,
    `
      class TestModifiableWithinConstructorInSetAccessor {
        #correctlyModifiableWithinConstructorInSetAccessor = 7;

        public constructor() {
          const self = this;

          const confusingObject = {
            set accessor(value: number) {
              self.#correctlyModifiableWithinConstructorInSetAccessor += value;
            },
          };
        }
      }
    `,
    `
      class TestModifiablePostDecremented {
        private correctlyModifiablePostDecremented = 7;

        public mutate() {
          this.correctlyModifiablePostDecremented -= 1;
        }
      }
    `,
    `
      class TestModifiablePostDecremented {
        #correctlyModifiablePostDecremented = 7;

        public mutate() {
          this.#correctlyModifiablePostDecremented -= 1;
        }
      }
    `,
    `
      class TestyModifiablePostIncremented {
        private correctlyModifiablePostIncremented = 7;

        public mutate() {
          this.correctlyModifiablePostIncremented += 1;
        }
      }
    `,
    `
      class TestyModifiablePostIncremented {
        #correctlyModifiablePostIncremented = 7;

        public mutate() {
          this.#correctlyModifiablePostIncremented += 1;
        }
      }
    `,
    `
      class TestModifiablePreDecremented {
        private correctlyModifiablePreDecremented = 7;

        public mutate() {
          --this.correctlyModifiablePreDecremented;
        }
      }
    `,
    `
      class TestModifiablePreDecremented {
        #correctlyModifiablePreDecremented = 7;

        public mutate() {
          --this.#correctlyModifiablePreDecremented;
        }
      }
    `,
    `
      class TestModifiablePreIncremented {
        private correctlyModifiablePreIncremented = 7;

        public mutate() {
          ++this.correctlyModifiablePreIncremented;
        }
      }
    `,
    `
      class TestModifiablePreIncremented {
        #correctlyModifiablePreIncremented = 7;

        public mutate() {
          ++this.#correctlyModifiablePreIncremented;
        }
      }
    `,
    `
      class TestProtectedModifiable {
        protected protectedModifiable = 7;
      }
    `,
    `
      class TestPublicModifiable {
        public publicModifiable = 7;
      }
    `,
    `
      class TestReadonlyParameter {
        public constructor(private readonly correctlyReadonlyParameter = 7) {}
      }
    `,
    `
      class TestCorrectlyModifiableParameter {
        public constructor(private correctlyModifiableParameter = 7) {}

        public mutate() {
          this.correctlyModifiableParameter += 1;
        }
      }
    `,
    {
      code: `
        class TestCorrectlyNonInlineLambdas {
          private correctlyNonInlineLambda = 7;
        }
      `,
      options: [
        {
          onlyInlineLambdas: true,
        },
      ],
    },
    {
      code: `
        class TestCorrectlyNonInlineLambdas {
          #correctlyNonInlineLambda = 7;
        }
      `,
      options: [
        {
          onlyInlineLambdas: true,
        },
      ],
    },
    `
      class TestComputedParameter {
        public mutate() {
          this['computed'] = 1;
        }
      }
    `,
    `
      class TestComputedParameter {
        private ['computed-ignored-by-rule'] = 1;
      }
    `,
    {
      code: `
class Foo {
  private value: number = 0;

  bar(newValue: { value: number }) {
    ({ value: this.value } = newValue);
    return this.value;
  }
}
      `,
    },
    {
      code: `
class Foo {
  #value: number = 0;

  bar(newValue: { value: number }) {
    ({ value: this.#value } = newValue);
    return this.#value;
  }
}
      `,
    },
    {
      code: `
function ClassWithName<TBase extends new (...args: any[]) => {}>(Base: TBase) {
  return class extends Base {
    private _name: string;

    public test(value: string) {
      this._name = value;
    }
  };
}
      `,
    },
    {
      code: `
function ClassWithName<TBase extends new (...args: any[]) => {}>(Base: TBase) {
  return class extends Base {
    #name: string;

    public test(value: string) {
      this.#name = value;
    }
  };
}
      `,
    },
    {
      code: `
class Foo {
  private value: Record<string, number> = {};

  bar(newValue: Record<string, number>) {
    ({ ...this.value } = newValue);
    return this.value;
  }
}
      `,
    },
    {
      code: `
class Foo {
  #value: Record<string, number> = {};

  bar(newValue: Record<string, number>) {
    ({ ...this.#value } = newValue);
    return this.#value;
  }
}
      `,
    },
    {
      code: `
class Foo {
  private value: number[] = [];

  bar(newValue: number[]) {
    [...this.value] = newValue;
    return this.value;
  }
}
      `,
    },
    {
      code: `
class Foo {
  #value: number[] = [];

  bar(newValue: number[]) {
    [...this.#value] = newValue;
    return this.#value;
  }
}
      `,
    },
    {
      code: `
class Foo {
  private value: number = 0;

  bar(newValue: number[]) {
    [this.value] = newValue;
    return this.value;
  }
}
      `,
    },
    {
      code: `
class Foo {
  #value: number = 0;

  bar(newValue: number[]) {
    [this.#value] = newValue;
    return this.#value;
  }
}
      `,
    },
    {
      code: `
        class Test {
          private testObj = {
            prop: '',
          };

          public test(): void {
            this.testObj = '';
          }
        }
      `,
    },
    {
      code: `
        class Test {
          #testObj = {
            prop: '',
          };

          public test(): void {
            this.#testObj = '';
          }
        }
      `,
    },
    {
      code: `
        class TestObject {
          public prop: number;
        }

        class Test {
          private testObj = new TestObject();

          public test(): void {
            this.testObj = new TestObject();
          }
        }
      `,
    },
    {
      code: `
        class TestObject {
          public prop: number;
        }

        class Test {
          #testObj = new TestObject();

          public test(): void {
            this.#testObj = new TestObject();
          }
        }
      `,
    },
    `
      class TestIntersection {
        private prop: number = 3;

        test() {
          const that = {} as this & { _foo: 'bar' };
          that.prop = 1;
        }
      }
    `,
    `
      class TestUnion {
        private prop: number = 3;

        test() {
          const that = {} as this | (this & { _foo: 'bar' });
          that.prop = 1;
        }
      }
    `,
    `
      class TestStaticIntersection {
        private static prop: number;

        test() {
          const that = {} as typeof TestStaticIntersection & { _foo: 'bar' };
          that.prop = 1;
        }
      }
    `,
    `
      class TestStaticUnion {
        private static prop: number = 1;

        test() {
          const that = {} as
            | typeof TestStaticUnion
            | (typeof TestStaticUnion & { _foo: 'bar' });
          that.prop = 1;
        }
      }
    `,
    `
      class TestBothIntersection {
        private prop1: number = 1;
        private static prop2: number;

        test() {
          const that = {} as typeof TestBothIntersection & this;
          that.prop1 = 1;
          that.prop2 = 1;
        }
      }
    `,
    `
      class TestBothIntersection {
        private prop1: number = 1;
        private static prop2: number;

        test() {
          const that = {} as this & typeof TestBothIntersection;
          that.prop1 = 1;
          that.prop2 = 1;
        }
      }
    `,
    `
      class TestStaticPrivateAccessor {
        private static accessor staticAcc = 1;
      }
    `,
    `
      class TestStaticPrivateFieldAccessor {
        static accessor #staticAcc = 1;
      }
    `,
    `
      class TestPrivateAccessor {
        private accessor acc = 3;
      }
    `,
    `
      class TestPrivateFieldAccessor {
        accessor #acc = 3;
      }
    `,
  ],
  invalid: [
    {
      code: `
        class TestIncorrectlyModifiableStatic {
          private static incorrectlyModifiableStatic = 7;
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'incorrectlyModifiableStatic',
          },
          endColumn: 53,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class TestIncorrectlyModifiableStatic {
          private static readonly incorrectlyModifiableStatic = 7;
        }
      `,
    },
    {
      code: `
        class TestIncorrectlyModifiableStatic {
          static #incorrectlyModifiableStatic = 7;
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: '#incorrectlyModifiableStatic',
          },
          endColumn: 46,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class TestIncorrectlyModifiableStatic {
          static readonly #incorrectlyModifiableStatic = 7;
        }
      `,
    },
    {
      code: `
        class TestIncorrectlyModifiableStaticArrow {
          private static incorrectlyModifiableStaticArrow = () => 7;
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'incorrectlyModifiableStaticArrow',
          },
          endColumn: 58,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class TestIncorrectlyModifiableStaticArrow {
          private static readonly incorrectlyModifiableStaticArrow = () => 7;
        }
      `,
    },
    {
      code: `
        class TestIncorrectlyModifiableStaticArrow {
          static #incorrectlyModifiableStaticArrow = () => 7;
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: '#incorrectlyModifiableStaticArrow',
          },
          endColumn: 51,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class TestIncorrectlyModifiableStaticArrow {
          static readonly #incorrectlyModifiableStaticArrow = () => 7;
        }
      `,
    },
    {
      code: `
        class TestIncorrectlyModifiableInline {
          private incorrectlyModifiableInline = 7;

          public createConfusingChildClass() {
            return class {
              private incorrectlyModifiableInline = 7;
            };
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'incorrectlyModifiableInline',
          },
          endColumn: 46,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
        {
          column: 15,
          data: {
            name: 'incorrectlyModifiableInline',
          },
          endColumn: 50,
          endLine: 7,
          line: 7,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class TestIncorrectlyModifiableInline {
          private readonly incorrectlyModifiableInline = 7;

          public createConfusingChildClass() {
            return class {
              private readonly incorrectlyModifiableInline = 7;
            };
          }
        }
      `,
    },
    {
      code: `
        class TestIncorrectlyModifiableInline {
          #incorrectlyModifiableInline = 7;

          public createConfusingChildClass() {
            return class {
              #incorrectlyModifiableInline = 7;
            };
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: '#incorrectlyModifiableInline',
          },
          endColumn: 39,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
        {
          column: 15,
          data: {
            name: '#incorrectlyModifiableInline',
          },
          endColumn: 43,
          endLine: 7,
          line: 7,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class TestIncorrectlyModifiableInline {
          readonly #incorrectlyModifiableInline = 7;

          public createConfusingChildClass() {
            return class {
              readonly #incorrectlyModifiableInline = 7;
            };
          }
        }
      `,
    },
    {
      code: `
        class TestIncorrectlyModifiableDelayed {
          private incorrectlyModifiableDelayed = 7;

          public constructor() {
            this.incorrectlyModifiableDelayed = 7;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'incorrectlyModifiableDelayed',
          },
          endColumn: 47,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class TestIncorrectlyModifiableDelayed {
          private readonly incorrectlyModifiableDelayed = 7;

          public constructor() {
            this.incorrectlyModifiableDelayed = 7;
          }
        }
      `,
    },
    {
      code: `
        class TestIncorrectlyModifiableDelayed {
          #incorrectlyModifiableDelayed = 7;

          public constructor() {
            this.#incorrectlyModifiableDelayed = 7;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: '#incorrectlyModifiableDelayed',
          },
          endColumn: 40,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class TestIncorrectlyModifiableDelayed {
          readonly #incorrectlyModifiableDelayed = 7;

          public constructor() {
            this.#incorrectlyModifiableDelayed = 7;
          }
        }
      `,
    },
    {
      code: `
        class TestChildClassExpressionModifiable {
          private childClassExpressionModifiable = 7;

          public createConfusingChildClass() {
            return class {
              private childClassExpressionModifiable = 7;

              mutate() {
                this.childClassExpressionModifiable += 1;
              }
            };
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'childClassExpressionModifiable',
          },
          endColumn: 49,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class TestChildClassExpressionModifiable {
          private readonly childClassExpressionModifiable = 7;

          public createConfusingChildClass() {
            return class {
              private childClassExpressionModifiable = 7;

              mutate() {
                this.childClassExpressionModifiable += 1;
              }
            };
          }
        }
      `,
    },
    {
      code: `
        class TestChildClassExpressionModifiable {
          #childClassExpressionModifiable = 7;

          public createConfusingChildClass() {
            return class {
              #childClassExpressionModifiable = 7;

              mutate() {
                this.#childClassExpressionModifiable += 1;
              }
            };
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: '#childClassExpressionModifiable',
          },
          endColumn: 42,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class TestChildClassExpressionModifiable {
          readonly #childClassExpressionModifiable = 7;

          public createConfusingChildClass() {
            return class {
              #childClassExpressionModifiable = 7;

              mutate() {
                this.#childClassExpressionModifiable += 1;
              }
            };
          }
        }
      `,
    },
    {
      code: `
        class TestIncorrectlyModifiablePostMinus {
          private incorrectlyModifiablePostMinus = 7;

          public mutate() {
            this.incorrectlyModifiablePostMinus - 1;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'incorrectlyModifiablePostMinus',
          },
          endColumn: 49,
          endLine: 3,

          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class TestIncorrectlyModifiablePostMinus {
          private readonly incorrectlyModifiablePostMinus = 7;

          public mutate() {
            this.incorrectlyModifiablePostMinus - 1;
          }
        }
      `,
    },
    {
      code: `
        class TestIncorrectlyModifiablePostMinus {
          #incorrectlyModifiablePostMinus = 7;

          public mutate() {
            this.#incorrectlyModifiablePostMinus - 1;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: '#incorrectlyModifiablePostMinus',
          },
          endColumn: 42,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class TestIncorrectlyModifiablePostMinus {
          readonly #incorrectlyModifiablePostMinus = 7;

          public mutate() {
            this.#incorrectlyModifiablePostMinus - 1;
          }
        }
      `,
    },
    {
      code: `
        class TestIncorrectlyModifiablePostPlus {
          private incorrectlyModifiablePostPlus = 7;

          public mutate() {
            this.incorrectlyModifiablePostPlus + 1;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'incorrectlyModifiablePostPlus',
          },
          endColumn: 48,
          endLine: 3,

          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class TestIncorrectlyModifiablePostPlus {
          private readonly incorrectlyModifiablePostPlus = 7;

          public mutate() {
            this.incorrectlyModifiablePostPlus + 1;
          }
        }
      `,
    },
    {
      code: `
        class TestIncorrectlyModifiablePostPlus {
          #incorrectlyModifiablePostPlus = 7;

          public mutate() {
            this.#incorrectlyModifiablePostPlus + 1;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: '#incorrectlyModifiablePostPlus',
          },
          endColumn: 41,
          endLine: 3,

          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class TestIncorrectlyModifiablePostPlus {
          readonly #incorrectlyModifiablePostPlus = 7;

          public mutate() {
            this.#incorrectlyModifiablePostPlus + 1;
          }
        }
      `,
    },
    {
      code: `
        class TestIncorrectlyModifiablePreMinus {
          private incorrectlyModifiablePreMinus = 7;

          public mutate() {
            -this.incorrectlyModifiablePreMinus;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'incorrectlyModifiablePreMinus',
          },
          endColumn: 48,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class TestIncorrectlyModifiablePreMinus {
          private readonly incorrectlyModifiablePreMinus = 7;

          public mutate() {
            -this.incorrectlyModifiablePreMinus;
          }
        }
      `,
    },
    {
      code: `
        class TestIncorrectlyModifiablePreMinus {
          #incorrectlyModifiablePreMinus = 7;

          public mutate() {
            -this.#incorrectlyModifiablePreMinus;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: '#incorrectlyModifiablePreMinus',
          },
          endColumn: 41,
          endLine: 3,

          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class TestIncorrectlyModifiablePreMinus {
          readonly #incorrectlyModifiablePreMinus = 7;

          public mutate() {
            -this.#incorrectlyModifiablePreMinus;
          }
        }
      `,
    },
    {
      code: `
        class TestIncorrectlyModifiablePrePlus {
          private incorrectlyModifiablePrePlus = 7;

          public mutate() {
            +this.incorrectlyModifiablePrePlus;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'incorrectlyModifiablePrePlus',
          },
          endColumn: 47,
          endLine: 3,

          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class TestIncorrectlyModifiablePrePlus {
          private readonly incorrectlyModifiablePrePlus = 7;

          public mutate() {
            +this.incorrectlyModifiablePrePlus;
          }
        }
      `,
    },
    {
      code: `
        class TestIncorrectlyModifiablePrePlus {
          #incorrectlyModifiablePrePlus = 7;

          public mutate() {
            +this.#incorrectlyModifiablePrePlus;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: '#incorrectlyModifiablePrePlus',
          },
          endColumn: 40,
          endLine: 3,

          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class TestIncorrectlyModifiablePrePlus {
          readonly #incorrectlyModifiablePrePlus = 7;

          public mutate() {
            +this.#incorrectlyModifiablePrePlus;
          }
        }
      `,
    },
    {
      code: `
        class TestOverlappingClassVariable {
          private overlappingClassVariable = 7;

          public workWithSimilarClass(other: SimilarClass) {
            other.overlappingClassVariable = 7;
          }
        }

        class SimilarClass {
          public overlappingClassVariable = 7;
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'overlappingClassVariable',
          },
          endColumn: 43,
          endLine: 3,

          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class TestOverlappingClassVariable {
          private readonly overlappingClassVariable = 7;

          public workWithSimilarClass(other: SimilarClass) {
            other.overlappingClassVariable = 7;
          }
        }

        class SimilarClass {
          public overlappingClassVariable = 7;
        }
      `,
    },
    {
      code: `
        class TestIncorrectlyModifiableParameter {
          public constructor(private incorrectlyModifiableParameter = 7) {}
        }
      `,
      errors: [
        {
          column: 30,
          data: {
            name: 'incorrectlyModifiableParameter',
          },
          endColumn: 68,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class TestIncorrectlyModifiableParameter {
          public constructor(private readonly incorrectlyModifiableParameter = 7) {}
        }
      `,
    },
    {
      code: `
        class TestIncorrectlyModifiableParameter {
          public constructor(
            public ignore: boolean,
            private incorrectlyModifiableParameter = 7,
          ) {}
        }
      `,
      errors: [
        {
          column: 13,
          data: {
            name: 'incorrectlyModifiableParameter',
          },
          endColumn: 51,
          endLine: 5,

          line: 5,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class TestIncorrectlyModifiableParameter {
          public constructor(
            public ignore: boolean,
            private readonly incorrectlyModifiableParameter = 7,
          ) {}
        }
      `,
    },
    {
      code: `
        class TestCorrectlyNonInlineLambdas {
          private incorrectlyInlineLambda = () => 7;
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'incorrectlyInlineLambda',
          },
          endColumn: 42,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      options: [
        {
          onlyInlineLambdas: true,
        },
      ],
      output: `
        class TestCorrectlyNonInlineLambdas {
          private readonly incorrectlyInlineLambda = () => 7;
        }
      `,
    },
    {
      code: `
function ClassWithName<TBase extends new (...args: any[]) => {}>(Base: TBase) {
  return class extends Base {
    private _name: string;
  };
}
      `,
      errors: [
        {
          column: 5,
          data: {
            name: '_name',
          },
          endColumn: 18,
          endLine: 4,
          line: 4,
          messageId: 'preferReadonly',
        },
      ],
      output: `
function ClassWithName<TBase extends new (...args: any[]) => {}>(Base: TBase) {
  return class extends Base {
    private readonly _name: string;
  };
}
      `,
    },
    {
      code: `
function ClassWithName<TBase extends new (...args: any[]) => {}>(Base: TBase) {
  return class extends Base {
    #name: string;
  };
}
      `,
      errors: [
        {
          column: 5,
          data: {
            name: '#name',
          },
          endColumn: 10,
          endLine: 4,
          line: 4,
          messageId: 'preferReadonly',
        },
      ],
      output: `
function ClassWithName<TBase extends new (...args: any[]) => {}>(Base: TBase) {
  return class extends Base {
    readonly #name: string;
  };
}
      `,
    },
    {
      code: `
        class Test {
          private testObj = {
            prop: '',
          };

          public test(): void {
            this.testObj.prop = '';
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'testObj',
          },
          endColumn: 26,
          endLine: 3,

          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class Test {
          private readonly testObj = {
            prop: '',
          };

          public test(): void {
            this.testObj.prop = '';
          }
        }
      `,
    },
    {
      code: `
        class Test {
          #testObj = {
            prop: '',
          };

          public test(): void {
            this.#testObj.prop = '';
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: '#testObj',
          },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class Test {
          readonly #testObj = {
            prop: '',
          };

          public test(): void {
            this.#testObj.prop = '';
          }
        }
      `,
    },
    {
      code: `
        class TestObject {
          public prop: number;
        }

        class Test {
          private testObj = new TestObject();

          public test(): void {
            this.testObj.prop = 10;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'testObj',
          },
          endColumn: 26,
          endLine: 7,
          line: 7,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class TestObject {
          public prop: number;
        }

        class Test {
          private readonly testObj = new TestObject();

          public test(): void {
            this.testObj.prop = 10;
          }
        }
      `,
    },
    {
      code: `
        class TestObject {
          public prop: number;
        }

        class Test {
          #testObj = new TestObject();

          public test(): void {
            this.#testObj.prop = 10;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: '#testObj',
          },
          endColumn: 19,
          endLine: 7,
          line: 7,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class TestObject {
          public prop: number;
        }

        class Test {
          readonly #testObj = new TestObject();

          public test(): void {
            this.#testObj.prop = 10;
          }
        }
      `,
    },
    {
      code: `
        class Test {
          private testObj = {
            prop: '',
          };
          public test(): void {
            this.testObj.prop;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'testObj',
          },
          endColumn: 26,
          endLine: 3,

          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class Test {
          private readonly testObj = {
            prop: '',
          };
          public test(): void {
            this.testObj.prop;
          }
        }
      `,
    },
    {
      code: `
        class Test {
          #testObj = {
            prop: '',
          };
          public test(): void {
            this.#testObj.prop;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: '#testObj',
          },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class Test {
          readonly #testObj = {
            prop: '',
          };
          public test(): void {
            this.#testObj.prop;
          }
        }
      `,
    },
    {
      code: `
        class Test {
          private testObj = {};
          public test(): void {
            this.testObj?.prop;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'testObj',
          },
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class Test {
          private readonly testObj = {};
          public test(): void {
            this.testObj?.prop;
          }
        }
      `,
    },
    {
      code: `
        class Test {
          #testObj = {};
          public test(): void {
            this.#testObj?.prop;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: '#testObj',
          },
          endColumn: 19,
          endLine: 3,

          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class Test {
          readonly #testObj = {};
          public test(): void {
            this.#testObj?.prop;
          }
        }
      `,
    },
    {
      code: `
        class Test {
          private testObj = {};
          public test(): void {
            this.testObj!.prop;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'testObj',
          },
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class Test {
          private readonly testObj = {};
          public test(): void {
            this.testObj!.prop;
          }
        }
      `,
    },
    {
      code: `
        class Test {
          #testObj = {};
          public test(): void {
            this.#testObj!.prop;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: '#testObj',
          },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class Test {
          readonly #testObj = {};
          public test(): void {
            this.#testObj!.prop;
          }
        }
      `,
    },
    {
      code: `
        class Test {
          private testObj = {};
          public test(): void {
            this.testObj.prop.prop = '';
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'testObj',
          },
          endColumn: 26,
          endLine: 3,

          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class Test {
          private readonly testObj = {};
          public test(): void {
            this.testObj.prop.prop = '';
          }
        }
      `,
    },
    {
      code: `
        class Test {
          #testObj = {};
          public test(): void {
            this.#testObj.prop.prop = '';
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: '#testObj',
          },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class Test {
          readonly #testObj = {};
          public test(): void {
            this.#testObj.prop.prop = '';
          }
        }
      `,
    },
    {
      code: `
        class Test {
          private testObj = {};
          public test(): void {
            this.testObj.prop.doesSomething();
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'testObj',
          },
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class Test {
          private readonly testObj = {};
          public test(): void {
            this.testObj.prop.doesSomething();
          }
        }
      `,
    },
    {
      code: `
        class Test {
          #testObj = {};
          public test(): void {
            this.#testObj.prop.doesSomething();
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: '#testObj',
          },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class Test {
          readonly #testObj = {};
          public test(): void {
            this.#testObj.prop.doesSomething();
          }
        }
      `,
    },
    {
      code: `
        class Test {
          private testObj = {};
          public test(): void {
            this.testObj?.prop.prop;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'testObj',
          },
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class Test {
          private readonly testObj = {};
          public test(): void {
            this.testObj?.prop.prop;
          }
        }
      `,
    },
    {
      code: `
        class Test {
          #testObj = {};
          public test(): void {
            this.#testObj?.prop.prop;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: '#testObj',
          },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class Test {
          readonly #testObj = {};
          public test(): void {
            this.#testObj?.prop.prop;
          }
        }
      `,
    },
    {
      code: `
        class Test {
          private testObj = {};
          public test(): void {
            this.testObj?.prop?.prop;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'testObj',
          },
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class Test {
          private readonly testObj = {};
          public test(): void {
            this.testObj?.prop?.prop;
          }
        }
      `,
    },
    {
      code: `
        class Test {
          #testObj = {};
          public test(): void {
            this.#testObj?.prop?.prop;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: '#testObj',
          },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class Test {
          readonly #testObj = {};
          public test(): void {
            this.#testObj?.prop?.prop;
          }
        }
      `,
    },
    {
      code: `
        class Test {
          private testObj = {};
          public test(): void {
            this.testObj.prop?.prop;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'testObj',
          },
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class Test {
          private readonly testObj = {};
          public test(): void {
            this.testObj.prop?.prop;
          }
        }
      `,
    },
    {
      code: `
        class Test {
          #testObj = {};
          public test(): void {
            this.#testObj.prop?.prop;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: '#testObj',
          },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class Test {
          readonly #testObj = {};
          public test(): void {
            this.#testObj.prop?.prop;
          }
        }
      `,
    },
    {
      code: `
        class Test {
          private testObj = {};
          public test(): void {
            this.testObj!.prop?.prop;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'testObj',
          },
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class Test {
          private readonly testObj = {};
          public test(): void {
            this.testObj!.prop?.prop;
          }
        }
      `,
    },
    {
      code: `
        class Test {
          #testObj = {};
          public test(): void {
            this.#testObj!.prop?.prop;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: '#testObj',
          },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class Test {
          readonly #testObj = {};
          public test(): void {
            this.#testObj!.prop?.prop;
          }
        }
      `,
    },
    {
      code: `
        class Test {
          private prop: number = 3;

          test() {
            const that = {} as this & { _foo: 'bar' };
            that._foo = 1;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'prop',
          },
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class Test {
          private readonly prop: number = 3;

          test() {
            const that = {} as this & { _foo: 'bar' };
            that._foo = 1;
          }
        }
      `,
    },
    {
      code: `
        class Test {
          private prop: number = 3;

          test() {
            const that = {} as this | (this & { _foo: 'bar' });
            that.prop;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'prop',
          },
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class Test {
          private readonly prop: number = 3;

          test() {
            const that = {} as this | (this & { _foo: 'bar' });
            that.prop;
          }
        }
      `,
    },
    {
      code: `
        class Test {
          private prop: number;

          constructor() {
            const that = {} as this & { _foo: 'bar' };
            that.prop = 1;
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'prop',
          },
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'preferReadonly',
        },
      ],
      output: `
        class Test {
          private readonly prop: number;

          constructor() {
            const that = {} as this & { _foo: 'bar' };
            that.prop = 1;
          }
        }
      `,
    },
  ],
});
