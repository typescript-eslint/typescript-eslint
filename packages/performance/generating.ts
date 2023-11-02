export function generateESLintConfig(parserOptions: string) {
  return `
/* eslint-env node */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ${parserOptions},
    tsconfigRootDir: __dirname
  },
  root: true,
};
`.trimStart();
}

export function generateJsFile(i: number) {
  return `
export async function example${i}(input) {
  return typeof input === 'number' ? input.toPrecision(1) : input.toUpperCase();
}
`.trimStart();
}

export function generateTsFile(i: number) {
  return `
export async function example${i}<T extends number | string>(input: T) {
  return typeof input === 'number' ? input.toPrecision(1) : input.toUpperCase();
}
`.trimStart();
}

export function generateTSConfig(allowJs: boolean) {
  return `
{
  "compilerOptions": {
    "allowJs": ${allowJs},
    "module": "ESNext",
    "strict": true,
    "target": "ESNext"
  }
}
`.trimStart();
}
