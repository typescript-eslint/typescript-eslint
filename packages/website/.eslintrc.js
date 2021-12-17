module.exports = {
  extends: [
    '../../.eslintrc.js',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  plugins: ['jsx-a11y', 'react', 'react-hooks'],
  overrides: [
    {
      files: [
        './src/pages/*.tsx',
        './src/components/**/*.tsx',
        './src/components/hooks/*.ts',
      ],
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
  rules: {
    'react/jsx-no-target-blank': 'off',
    'react/no-unescaped-entities': 'off',
    '@typescript-eslint/internal/prefer-ast-types-enum': 'off',
    'react-hooks/exhaustive-deps': 'off', // TODO: enable it later
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
