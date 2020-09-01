const packages = {
  7: 'eslint',
  6: 'eslint-6',
};
const version = process.env.ESLINT_VERSION ?? 6;
console.log('using eslint version', version);

// Require the original module.
const eslint = jest.requireActual(
  `${packages[version]}/lib/rules/no-unused-vars`,
);

console.log('eslint', eslint);

export default eslint;
