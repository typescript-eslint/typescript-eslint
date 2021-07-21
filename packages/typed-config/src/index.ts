declare global {
  // a namespace makes it easy to group all of the types together
  // so that they don't pollute the global namespace
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ESLintConfig {
    export type RuleLevel = 0 | 1 | 2 | 'off' | 'warn' | 'error';
    export type RuleLevelAndNoOptions = RuleLevel | [RuleLevel];
    export type RuleLevelAndUnknownOptions =
      | RuleLevelAndNoOptions
      | [RuleLevel, ...unknown[]];

    interface Config {
      /**
       * An environment defines global variables that are predefined.
       *
       * https://eslint.org/docs/user-guide/configuring#specifying-environments
       */
      env?: Env;

      /**
       * If you want to extend a specific configuration file, you can use the extends property and specify the path to
       * the file.
       *
       * Accepts any valid node require compatible string.
       * Also accepts the package name, excluding `eslint-config-`, eg:
       * - `eslint-config-prettier` can be specified as `prettier`
       *
       * https://eslint.org/docs/user-guide/configuring#extending-configuration-files
       */
      extends?: string[];

      /**
       * The no-undef rule will warn on variables that are accessed but not defined within the same file. If you are
       * using global variables inside of a file then it's worthwhile to define those globals so that ESLint will
       * not warn about their usage.
       *
       * Set each global variable name equal to true to allow the variable to be overwritten or false to disallow overwriting.
       *
       * https://eslint.org/docs/user-guide/configuring#specifying-globals
       */
      globals?: Globals;

      /**
       * Tell ESLint to ignore specific files and directories.
       *
       * Each value must use the same pattern as the `.eslintignore` file.
       */
      ignorePatterns?: string[];

      /**
       * Prevent comments from changing config or rules
       */
      noInlineConfig?: boolean;

      /**
       * The parser to use to parse files.
       *
       * By default, ESLint uses Espree as its parser. However, if you use a language that Espree doesn't support
       * (such as typescript), or if you use "bleeding-edge" JS features that Espree doesn't support, you can specify
       * a parser that can parse the files correctly.
       *
       * Accepts any valid node require compatible string.
       *
       * https://eslint.org/docs/user-guide/configuring#specifying-parser
       */
      parser?:
        | string
        // these won't appear in the types, nor will they be auto-suggested, but it's good to provide some examples
        | '@typescript-eslint/parser'
        | 'babel-eslint'
        | 'vue-eslint-parser';

      /**
       * The configuration options that will be passed to the parser.
       *
       * https://eslint.org/docs/user-guide/configuring#specifying-parser-options
       */
      parserOptions?: ParserOptions;

      /**
       * ESLint supports the use of third-party plugins. Before using the plugin, you have to install it using npm.
       *
       * Accepts any valid node requrie compatible string.
       * Also accepts the package name, excluding `eslint-plugin-`, eg:
       * - `eslint-plugin-react` can be specified as `react`
       * - `@typescript-eslint/eslint-plugin` can be specified as `@typescript-eslint`
       * - `@typescript-eslint/eslint-plugin-tslint` can be speficied as `@typescript-eslint/tslint`
       *
       * https://eslint.org/docs/user-guide/configuring#configuring-plugins
       */
      plugins?: string | string[];

      /**
       * The processor to use pre-process files.
       *
       * Processors can extract JavaScript code from another kind of files, so that ESLint can lint the JavaScript.
       *
       * Accepts any valid node require compatible string.
       *
       * https://eslint.org/docs/user-guide/configuring#specifying-processor
       */
      processor?: string;

      /**
       * By default, ESLint will look for configuration files in all parent folders up to the root directory.
       * This can be useful if you want all of your projects to follow a certain convention, but can sometimes lead to
       * unexpected results.
       *
       * To limit ESLint to a specific project, set this to `true` in a configuration in the root of your project.
       */
      root?: boolean;

      /**
       * Configuration for individual ESLint rules.
       *
       * https://eslint.org/docs/user-guide/configuring#configuring-rules
       */
      rules?: Rules;

      /**
       * Some plugins use shared settings amongst their rules.
       * Settings placed here are passed to every single rule that gets executed.
       * Refer to the documentation for each plugin you are using to determine if shared settings are required.
       */
      settings?: Settings;
    }
    interface ConfigWithOverrides extends Config {
      /**
       * Allows to override configuration for specific files and folders, specified by glob patterns.
       *
       * https://eslint.org/docs/user-guide/configuring#configuration-based-on-glob-patterns
       */
      overrides?: ({
        /**
         * Glob pattern for files to apply 'overrides' configuration, relative to the directory of the config file
         */
        files: string[];
        /**
         * If a file matches any of the 'excludedFiles' glob patterns, the 'overrides' configuration won’t apply
         */
        excludedFiles?: string | string[];
      } & Config)[];
    }

    interface Env {
      [k: string]: boolean | undefined; // need the | undefined so that 3rd parties can specify optional props

      /**
       * defines require() and define() as global variables as per the amd spec
       */
      amd?: boolean;
      /**
       * AppleScript global variables
       */
      applescript?: boolean;
      /**
       * Atom test helper globals
       */
      atomtest?: boolean;
      /**
       * browser global variables
       */
      browser?: boolean;
      /**
       * CommonJS global variables and CommonJS scoping (use this for browser-only code that uses Browserify/WebPack)
       */
      commonjs?: boolean;
      /**
       * Globals common to both Node and Browser
       */
      'shared-node-browser'?: boolean;
      /**
       * Ember test helper globals
       */
      embertest?: boolean;
      /**
       * enable all ECMAScript 6 features except for modules
       */
      es6?: boolean;
      /**
       * GreaseMonkey globals
       */
      greasemonkey?: boolean;
      /**
       * adds all of the Jasmine testing global variables for version 1.3 and 2.0
       */
      jasmine?: boolean;
      /**
       * Jest global variables
       */
      jest?: boolean;
      /**
       * jQuery global variables
       */
      jquery?: boolean;
      /**
       * Meteor global variables
       */
      meteor?: boolean;
      /**
       * adds all of the Mocha test global variables
       */
      mocha?: boolean;
      /**
       * MongoDB global variables
       */
      mongo?: boolean;
      /**
       * Java 8 Nashorn global variables
       */
      nashorn?: boolean;
      /**
       * Node.js global variables and Node.js scoping
       */
      node?: boolean;
      /**
       * PhantomJS global variables
       */
      phantomjs?: boolean;
      /**
       * Prototype.js global variables
       */
      prototypejs?: boolean;
      /**
       * Protractor global variables
       */
      protractor?: boolean;
      /**
       * QUnit global variables
       */
      qunit?: boolean;
      /**
       * Service Worker global variables
       */
      serviceworker?: boolean;
      /**
       * ShellJS global variables
       */
      shelljs?: boolean;
      /**
       * WebExtensions globals
       */
      webextensions?: boolean;
      /**
       * web workers global variables
       */
      worker?: boolean;
    }

    type GlobalsLevel = 'readonly' | 'writable' | 'off' | boolean;
    interface Globals {
      [name: string]: GlobalsLevel | undefined; // need the | undefined so that 3rd parties can specify optional props
    }

    interface ParserOptions {
      /**
       * The version of ECMAScript syntax you want to use
       */
      ecmaVersion?:
        | 3
        | 5
        | 6
        | 2015 // same as 6
        | 7
        | 2016 // same as 7
        | 8
        | 2017 // same as 8
        | 9
        | 2018 // same as 9
        | 10
        | 2019 // same as 10
        | 11
        | 2020; // same as 11

      /**
       * Set to "script" (default) or "module" if your code is in ECMAScript modules.
       */
      sourceType?: 'script' | 'module';

      /**
       * An object indicating which additional language features you'd like to use.
       */
      ecmaFeatures?: {
        /**
         * Allow return statements in the global scope.
         */
        globalReturn?: boolean;
        /**
         * Enable global strict mode (if ecmaVersion is 5 or greater).
         */
        impliedStrict?: boolean;
        /**
         * Enable JSX.
         */
        jsx?: boolean;
      };

      [name: string]: unknown;
    }

    interface Rules {
      [name: string]: RuleLevel | RuleLevelAndUnknownOptions;
    }

    interface Settings {
      [name: string]: unknown;
    }
  }
}

function typedConfig(
  config: ESLintConfig.ConfigWithOverrides,
): ESLintConfig.ConfigWithOverrides {
  return config;
}

export { typedConfig, ESLintConfig };
