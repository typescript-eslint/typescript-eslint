import markdown from 'eslint-plugin-markdown';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  tseslint.configs.base,
  // this will also ensure that eslint will force lint the markdown files
  { plugins: { markdown }, files: ['**/*.md'], processor: 'markdown/markdown' },
  {
    files: ['**/*.md/*.{js,ts,jsx,tsx,javascript,node}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': 'error',
    },
  },
);
