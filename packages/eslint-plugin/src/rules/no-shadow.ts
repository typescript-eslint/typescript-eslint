import {
  TSESTree,
  TSESLint,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type MessageIds = 'noShadow';
type Options = [
  {
    allow?: string[];
    builtinGlobals?: boolean;
    hoist?: 'all' | 'functions' | 'never';
    ignoreTypeValueShadow?: boolean;
    ignoreFunctionTypeParameterNameValueShadow?: boolean;
  },
];

export default util.createRule<Options, MessageIds>({
  name: 'no-shadow',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow variable declarations from shadowing variables declared in the outer scope',
      category: 'Variables',
      recommended: false,
      extendsBaseRule: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          builtinGlobals: {
            type: 'boolean',
          },
          hoist: {
            enum: ['all', 'functions', 'never'],
          },
          allow: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          ignoreTypeValueShadow: {
            type: 'boolean',
          },
          ignoreFunctionTypeParameterNameValueShadow: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noShadow: "'{{name}}' is already declared in the upper scope.",
    },
  },
  defaultOptions: [
    {
      allow: [],
      builtinGlobals: false,
      hoist: 'functions',
      ignoreTypeValueShadow: true,
      ignoreFunctionTypeParameterNameValueShadow: true,
    },
  ],
  create(context, [options]) {
    /**
     * Check if variable is a `this` parameter.
     */
    function isThisParam(variable: TSESLint.Scope.Variable): boolean {
      return variable.defs[0].type === 'Parameter' && variable.name === 'this';
    }

    function isTypeValueShadow(
      variable: TSESLint.Scope.Variable,
      shadowed: TSESLint.Scope.Variable,
    ): boolean {
      if (options.ignoreTypeValueShadow !== true) {
        return false;
      }

      if (!('isValueVariable' in variable)) {
        // this shouldn't happen...
        return false;
      }

      const isShadowedValue =
        'isValueVariable' in shadowed ? shadowed.isValueVariable : true;
      return variable.isValueVariable !== isShadowedValue;
    }

    function isFunctionTypeParameterNameValueShadow(
      variable: TSESLint.Scope.Variable,
      shadowed: TSESLint.Scope.Variable,
    ): boolean {
      if (options.ignoreFunctionTypeParameterNameValueShadow !== true) {
        return false;
      }

      if (!('isValueVariable' in variable)) {
        // this shouldn't happen...
        return false;
      }

      const isShadowedValue =
        'isValueVariable' in shadowed ? shadowed.isValueVariable : true;
      if (!isShadowedValue) {
        return false;
      }

      const id = variable.identifiers[0];
      return util.isFunctionType(id.parent);
    }

    /**
     * Check if variable name is allowed.
     * @param variable The variable to check.
     * @returns Whether or not the variable name is allowed.
     */
    function isAllowed(variable: TSESLint.Scope.Variable): boolean {
      return options.allow!.indexOf(variable.name) !== -1;
    }

    /**
     * Checks if a variable of the class name in the class scope of ClassDeclaration.
     *
     * ClassDeclaration creates two variables of its name into its outer scope and its class scope.
     * So we should ignore the variable in the class scope.
     * @param variable The variable to check.
     * @returns Whether or not the variable of the class name in the class scope of ClassDeclaration.
     */
    function isDuplicatedClassNameVariable(
      variable: TSESLint.Scope.Variable,
    ): boolean {
      const block = variable.scope.block;

      return (
        block.type === AST_NODE_TYPES.ClassDeclaration &&
        block.id === variable.identifiers[0]
      );
    }

    /**
     * Checks if a variable of the class name in the class scope of TSEnumDeclaration.
     *
     * TSEnumDeclaration creates two variables of its name into its outer scope and its class scope.
     * So we should ignore the variable in the class scope.
     * @param variable The variable to check.
     * @returns Whether or not the variable of the class name in the class scope of TSEnumDeclaration.
     */
    function isDuplicatedEnumNameVariable(
      variable: TSESLint.Scope.Variable,
    ): boolean {
      const block = variable.scope.block;

      return (
        block.type === AST_NODE_TYPES.TSEnumDeclaration &&
        block.id === variable.identifiers[0]
      );
    }

    /**
     * Checks if a variable is inside the initializer of scopeVar.
     *
     * To avoid reporting at declarations such as `var a = function a() {};`.
     * But it should report `var a = function(a) {};` or `var a = function() { function a() {} };`.
     * @param variable The variable to check.
     * @param scopeVar The scope variable to look for.
     * @returns Whether or not the variable is inside initializer of scopeVar.
     */
    function isOnInitializer(
      variable: TSESLint.Scope.Variable,
      scopeVar: TSESLint.Scope.Variable,
    ): boolean {
      const outerScope = scopeVar.scope;
      const outerDef = scopeVar.defs[0];
      const outer = outerDef?.parent?.range;
      const innerScope = variable.scope;
      const innerDef = variable.defs[0];
      const inner = innerDef?.name.range;

      return !!(
        outer &&
        inner &&
        outer[0] < inner[0] &&
        inner[1] < outer[1] &&
        ((innerDef.type === 'FunctionName' &&
          innerDef.node.type === AST_NODE_TYPES.FunctionExpression) ||
          innerDef.node.type === AST_NODE_TYPES.ClassExpression) &&
        outerScope === innerScope.upper
      );
    }

    /**
     * Get a range of a variable's identifier node.
     * @param variable The variable to get.
     * @returns The range of the variable's identifier node.
     */
    function getNameRange(
      variable: TSESLint.Scope.Variable,
    ): TSESTree.Range | undefined {
      const def = variable.defs[0];
      return def?.name.range;
    }

    /**
     * Checks if a variable is in TDZ of scopeVar.
     * @param variable The variable to check.
     * @param scopeVar The variable of TDZ.
     * @returns Whether or not the variable is in TDZ of scopeVar.
     */
    function isInTdz(
      variable: TSESLint.Scope.Variable,
      scopeVar: TSESLint.Scope.Variable,
    ): boolean {
      const outerDef = scopeVar.defs[0];
      const inner = getNameRange(variable);
      const outer = getNameRange(scopeVar);

      return !!(
        inner &&
        outer &&
        inner[1] < outer[0] &&
        // Excepts FunctionDeclaration if is {"hoist":"function"}.
        (options.hoist !== 'functions' ||
          !outerDef ||
          outerDef.node.type !== AST_NODE_TYPES.FunctionDeclaration)
      );
    }

    /**
     * Finds the variable by a given name in a given scope and its upper scopes.
     * @param initScope A scope to start find.
     * @param name A variable name to find.
     * @returns A found variable or `null`.
     */
    function getVariableByName(
      initScope: TSESLint.Scope.Scope | null,
      name: string,
    ): TSESLint.Scope.Variable | null {
      let scope = initScope;

      while (scope) {
        const variable = scope.set.get(name);

        if (variable) {
          return variable;
        }

        scope = scope.upper;
      }

      return null;
    }

    /**
     * Checks the current context for shadowed variables.
     * @param {Scope} scope Fixme
     */
    function checkForShadows(scope: TSESLint.Scope.Scope): void {
      const variables = scope.variables;

      for (const variable of variables) {
        // ignore "arguments"
        if (variable.identifiers.length === 0) {
          continue;
        }

        // this params are pseudo-params that cannot be shadowed
        if (isThisParam(variable)) {
          continue;
        }

        // ignore variables of a class name in the class scope of ClassDeclaration
        if (isDuplicatedClassNameVariable(variable)) {
          continue;
        }

        // ignore variables of a class name in the class scope of ClassDeclaration
        if (isDuplicatedEnumNameVariable(variable)) {
          continue;
        }

        // ignore configured allowed names
        if (isAllowed(variable)) {
          continue;
        }

        // Gets shadowed variable.
        const shadowed = getVariableByName(scope.upper, variable.name);
        if (!shadowed) {
          continue;
        }

        // ignore type value variable shadowing if configured
        if (isTypeValueShadow(variable, shadowed)) {
          continue;
        }

        // ignore function type parameter name shadowing if configured
        if (isFunctionTypeParameterNameValueShadow(variable, shadowed)) {
          continue;
        }

        const isESLintGlobal = 'writeable' in shadowed;
        if (
          (shadowed.identifiers.length > 0 ||
            (options.builtinGlobals && isESLintGlobal)) &&
          !isOnInitializer(variable, shadowed) &&
          !(options.hoist !== 'all' && isInTdz(variable, shadowed))
        ) {
          context.report({
            node: variable.identifiers[0],
            messageId: 'noShadow',
            data: {
              name: variable.name,
            },
          });
        }
      }
    }

    return {
      'Program:exit'(): void {
        const globalScope = context.getScope();
        const stack = globalScope.childScopes.slice();

        while (stack.length) {
          const scope = stack.pop()!;

          stack.push(...scope.childScopes);
          checkForShadows(scope);
        }
      },
    };
  },
});
