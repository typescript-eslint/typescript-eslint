/**
 * The goal of this ruleset is to update the eslint:recommended config to better
 * suit Typescript. There are two main reasons to change the configuration:
 * 1. The Typescript compiler natively checks some things that therefore don't
 *    need extra rules anymore.
 * 2. Typescript allows for more modern Javascript code that can thus be
 *    enabled.
 */
export default {
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        /**
         * 1. Disable things that are checked by Typescript
         */
        //Checked by Typescript - ts(2378)
        'getter-return': false,
        // Checked by Typescript - ts(2300)
        'no-dupe-args': false,
        // Checked by Typescript - ts(1117)
        'no-dupe-keys': false,
        // Checked by Typescript - ts(7027)
        'no-unreachable': false,
        // Checked by Typescript - ts(2367)
        'valid-typeof': false,
        // Checked by Typescript - ts(2588)
        'no-const-assign': false,
        // Checked by Typescript - ts(2588)
        'no-new-symbol': false,
        // Checked by Typescript - ts(2376)
        'no-this-before-super': false,
        // This is checked by Typescript using the option `strictNullChecks`.
        'no-undef': false,
        /**
         * 2. Enable more ideomatic code
         */
        // Typescript allows const and let instead of var.
        'no-var': 'error',
        'prefer-const': 'error',
        // The spread operator/rest parameters should be prefered in Typescript.
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
        // This is already checked by Typescript.
        'no-dupe-class-members': 'error',
      },
    },
  ],
};
