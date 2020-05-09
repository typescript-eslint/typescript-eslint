import rule from '../../src/rules/prefer-readonly';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2015,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
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
      class TestModifiableStatic {
        private static correctlyModifiableStatic = 7;

        public constructor() {
          TestModifiableStatic.correctlyModifiableStatic += 1;
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
      class TestReadonlyInline {
        private readonly correctlyReadonlyInline = 7;
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
      class TestModifiableDelayed {
        private correctlyModifiableDelayed = 7;

        public mutate() {
          this.correctlyModifiableDelayed += 1;
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
      class TestModifiablePostDecremented {
        private correctlyModifiablePostDecremented = 7;

        public mutate() {
          this.correctlyModifiablePostDecremented -= 1;
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
      class TestModifiablePreDecremented {
        private correctlyModifiablePreDecremented = 7;

        public mutate() {
          --this.correctlyModifiablePreDecremented;
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
    `
      class TestComputedParameter {
        public mutate() {
          this['computed'] = 1;
        }
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
  private value: number = 0;

  bar(newValue: number[]) {
    [this.value] = newValue;
    return this.value;
  }
}
      `,
    },
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
          data: {
            name: 'incorrectlyModifiableStatic',
          },
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
        class TestIncorrectlyModifiableStaticArrow {
          private static incorrectlyModifiableStaticArrow = () => 7;
        }
      `,
      errors: [
        {
          data: {
            name: 'incorrectlyModifiableStaticArrow',
          },
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
          data: {
            name: 'incorrectlyModifiableInline',
          },
          line: 3,
          messageId: 'preferReadonly',
        },
        {
          data: {
            name: 'incorrectlyModifiableInline',
          },
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
        class TestIncorrectlyModifiableDelayed {
          private incorrectlyModifiableDelayed = 7;

          public constructor() {
            this.incorrectlyModifiableDelayed = 7;
          }
        }
      `,
      errors: [
        {
          data: {
            name: 'incorrectlyModifiableDelayed',
          },
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
          data: {
            name: 'childClassExpressionModifiable',
          },
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
        class TestIncorrectlyModifiablePostMinus {
          private incorrectlyModifiablePostMinus = 7;

          public mutate() {
            this.incorrectlyModifiablePostMinus - 1;
          }
        }
      `,
      errors: [
        {
          data: {
            name: 'incorrectlyModifiablePostMinus',
          },
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
        class TestIncorrectlyModifiablePostPlus {
          private incorrectlyModifiablePostPlus = 7;

          public mutate() {
            this.incorrectlyModifiablePostPlus + 1;
          }
        }
      `,
      errors: [
        {
          data: {
            name: 'incorrectlyModifiablePostPlus',
          },
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
        class TestIncorrectlyModifiablePreMinus {
          private incorrectlyModifiablePreMinus = 7;

          public mutate() {
            -this.incorrectlyModifiablePreMinus;
          }
        }
      `,
      errors: [
        {
          data: {
            name: 'incorrectlyModifiablePreMinus',
          },
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
        class TestIncorrectlyModifiablePrePlus {
          private incorrectlyModifiablePrePlus = 7;

          public mutate() {
            +this.incorrectlyModifiablePrePlus;
          }
        }
      `,
      errors: [
        {
          data: {
            name: 'incorrectlyModifiablePrePlus',
          },
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
          data: {
            name: 'overlappingClassVariable',
          },
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
          data: {
            name: 'incorrectlyModifiableParameter',
          },
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
          data: {
            name: 'incorrectlyModifiableParameter',
          },
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
          data: {
            name: 'incorrectlyInlineLambda',
          },
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
  ],
});
