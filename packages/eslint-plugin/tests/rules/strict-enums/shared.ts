import { getFixturesRootDir, RuleTester } from '../../RuleTester';

const rootDir = getFixturesRootDir();
export const strictEnumsRuleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

/** A number enum. */
export const fruitEnumDefinition = `
enum Fruit { Apple, Banana, Cherry }
`;

/** A different number enum. */
export const fruit2EnumDefinition = `
enum Fruit2 {
  Apple2,
  Banana2,
  Cherry2,
}
`;

/**
 * A string enum.
 *
 * String enums are almost exclusively used for comparison tests, since the
 * TypeScript compiler does a good job of ensuring safety for string enum
 * variable assignment and usage in functions.
 */
export const vegetableEnumDefinition = `
 enum Vegetable {
   Lettuce = 'lettuce',
   Carrot = 'carrot',
   Celery = 'celery',
 }
 `;

/** A different string enum. */
export const vegetable2EnumDefinition = `
enum Vegetable2 {
  Lettuce2 = 'lettuce2',
  Carrot2 = 'carrot2',
  Celery2 = 'celery2',
}
`;
