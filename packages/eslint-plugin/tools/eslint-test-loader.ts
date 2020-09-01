const packages = {
  5: 'eslint-5',
  6: 'eslint-6',
  7: 'eslint',
};
const version = process.env.ESLINT_VERSION ?? 7;

export function loadEslintModule(
  path: string,
): ReturnType<typeof jest.requireActual> {
  // Require the original module.
  return jest.requireActual(`${packages[version]}${path}`);
}
