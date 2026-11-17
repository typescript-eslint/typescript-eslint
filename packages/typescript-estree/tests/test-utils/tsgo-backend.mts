// Vitest can't require() the TypeScript sources that the parser lazily loads the tsgo backend from.
if (process.env.TYPESCRIPT_ESLINT_EXPERIMENTAL_BACKEND === 'tsgo') {
  await import('../../src/native/index.js');
}
