import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  tseslint.configs.base,
  ...pluginVue.configs['flat/essential'],
  {
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        project: '/usr/linked/tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      'semi-spacing': 'error',
    },
  },
);
