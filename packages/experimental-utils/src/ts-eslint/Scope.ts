/* eslint-disable @typescript-eslint/no-namespace */

import * as scopeManager from '@typescript-eslint/scope-manager';
import { TSESTree } from '@typescript-eslint/types';

namespace Scope {
  // ESLint defines global variables using the eslint-scope Variable class
  // So a variable in the scope may be either of these
  declare class ESLintScopeVariable {
    public readonly defs: Definition[];
    public readonly identifiers: TSESTree.Identifier[];
    public readonly name: string;
    public readonly references: Reference[];
    public readonly scope: Scope;

    /**
     * Written to by ESLint.
     * If this key exists, this variable is a global variable added by ESLint.
     * If this is `true`, this variable can be assigned arbitrary values.
     * If this is `false`, this variable is readonly.
     */
    public writeable?: boolean; // note that this isn't a typo - ESlint uses this spelling here

    /**
     * Written to by ESLint.
     * This property is undefined if there are no globals directive comments.
     * The array of globals directive comments which defined this global variable in the source code file.
     */
    public eslintExplicitGlobal?: boolean;

    /**
     * Written to by ESLint.
     * The configured value in config files. This can be different from `variable.writeable` if there are globals directive comments.
     */
    public eslintImplicitGlobalSetting?: 'readonly' | 'writable';

    /**
     * Written to by ESLint.
     * If this key exists, it is a global variable added by ESLint.
     * If `true`, this global variable was defined by a globals directive comment in the source code file.
     */
    public eslintExplicitGlobalComments?: TSESTree.Comment[];
  }

  export type ScopeManager = scopeManager.ScopeManager;
  export type Reference = scopeManager.Reference;
  export type Variable = scopeManager.Variable | ESLintScopeVariable;
  export type Scope = scopeManager.Scope;
  export const ScopeType = scopeManager.ScopeType;
  // TODO - in the next major, clean this up with a breaking change
  export type DefinitionType = scopeManager.Definition;
  export type Definition = scopeManager.Definition;
  export const DefinitionType = scopeManager.DefinitionType;
}

export { Scope };
