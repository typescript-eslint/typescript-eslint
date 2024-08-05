import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';

export default tseslint.config(
  tseslint.configs.base,
  ...pluginVue.configs['flat/essential'],
  {
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true }, parser: tseslint.parser },
    },
    rules: { '@typescript-eslint/no-explicit-any': 'error' },
  },
);
