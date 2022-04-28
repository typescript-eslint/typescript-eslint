import { getFixturesRootDir, RuleTester } from '../RuleTester';

const rootDir = getFixturesRootDir();
export const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

/** A number enum. */
export const fruitEnumDefinition = `
enum Fruit {
  Apple,
  Banana,
  Pear,
}
`;

/** A different number enum. */
export const fruit2EnumDefinition = `
enum Fruit2 {
  Apple2,
  Banana2,
  Pear2,
}
`;
