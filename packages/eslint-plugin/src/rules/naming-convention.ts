import {
  AST_NODE_TYPES,
  JSONSchema,
  TSESTree,
  TSESLint,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type MessageIds =
  | 'unexpectedUnderscore'
  | 'missingUnderscore'
  | 'missingAffix'
  | 'doesNotMatchFormat';

// #region Options Type Config

type PredefinedFormats =
  | 'camelCase'
  | 'strictCamelCase'
  | 'PascalCase'
  | 'StrictPascalCase'
  | 'UPPER_CASE'
  | 'snake_case';
type UnderscroreOptions = 'forbid' | 'allow' | 'require';
interface FormatOptions {
  leadingUnderscore?: UnderscroreOptions;
  trailingUnderscore?: UnderscroreOptions;
  prefix?: string[];
  suffix?: string[];
  format: PredefinedFormats[];
}

type NonDefaultSelectors =
  | 'variable'
  | 'function'
  | 'parameter'
  | 'property'
  | 'parameterProperty'
  | 'enumMember'
  | 'method'
  | 'accessor'
  | 'class'
  | 'interface'
  | 'typeAlias'
  | 'typeParameter'
  | 'enum';
type Selectors = 'default' | NonDefaultSelectors;
type Modifiers =
  | 'readonly'
  | 'static'
  | 'public'
  | 'protected'
  | 'private'
  | 'abstract';
type TypeModifiers = 'boolean' | 'string' | 'number' | 'function' | 'array';

interface SelectorBase<TType extends Selectors> {
  selector: TType;
  modifiers?: Modifiers[];
  types?: TypeModifiers[];
}
type Selector<TType extends Selectors> = FormatOptions &
  SelectorBase<TType> & {
    filter?: string;
  };
type NormalizedSelector<TType extends Selectors> = FormatOptions &
  SelectorBase<TType> & {
    filter: RegExp | null;
    // calculated ordering weight based on modifiers
    weight: number;
  };

// Note that this intentionally does not strictly type the modifiers/types properties.
// This is because doing so creates a huge headache, as the rule's code doesn't need to care.
// The JSON Schema strictly types these properties, so we know the user won't input invalid config.
type Options = (
  | Selector<'default'>
  | Selector<'variable'>
  | Selector<'function'>
  | Selector<'parameter'>
  | Selector<'property'>
  | Selector<'parameterProperty'>
  | Selector<'method'>
  | Selector<'accessor'>
  | Selector<'enumMember'>
  | Selector<'class'>
  | Selector<'interface'>
  | Selector<'typeAlias'>
  | Selector<'typeParameter'>
  | Selector<'enum'>
)[];

// #endregion Options Type Config

// #region Schema Config

const UNDERSCORE_SCHEMA: JSONSchema.JSONSchema4 = {
  type: 'string',
  enum: ['forbid', 'allow', 'require'],
};
const PREFIX_SUFFIX_SCHEMA: JSONSchema.JSONSchema4 = {
  type: 'array',
  items: {
    type: 'string',
    minLength: 1,
  },
  minItems: 1,
  additionalItems: false,
};
type JSONSchemaProperties = Record<string, JSONSchema.JSONSchema4>;
const FORMAT_OPTIONS_PROPERTIES: JSONSchemaProperties = {
  leadingUnderscore: UNDERSCORE_SCHEMA,
  trailingUnderscore: UNDERSCORE_SCHEMA,
  prefix: PREFIX_SUFFIX_SCHEMA,
  suffix: PREFIX_SUFFIX_SCHEMA,
  format: {
    type: 'array',
    items: {
      type: 'string',
      enum: [
        'camelCase',
        'strictCamelCase',
        'PascalCase',
        'StrictPascalCase',
        'UPPER_CASE',
        'snake_case',
      ],
    },
    minItems: 1,
    additionalItems: false,
  },
};
const SELECTOR_BASE: JSONSchemaProperties = {
  filter: {
    type: 'string',
    minLength: 1,
  },
};
const TYPE_MODIFIERS_SCHEMA: JSONSchema.JSONSchema4 = {
  type: 'array',
  items: {
    type: 'string',
    enum: ['boolean', 'string', 'number', 'function', 'array'],
  },
  additionalItems: false,
};
function selectorSchema(
  type: Selectors,
  types: boolean,
  modifiers?: Modifiers[],
): JSONSchema.JSONSchema4[] {
  const selector: JSONSchemaProperties = {
    ...SELECTOR_BASE,
    selector: {
      type: 'string',
      enum: [type],
    },
  };
  if (modifiers && modifiers.length > 0) {
    selector.modifiers = {
      type: 'array',
      items: {
        type: 'string',
        enum: modifiers,
      },
      additionalItems: false,
    };
  }
  if (types) {
    selector.types = TYPE_MODIFIERS_SCHEMA;
  }

  return [
    {
      type: 'object',
      properties: {
        ...FORMAT_OPTIONS_PROPERTIES,
        ...selector,
      },
      required: ['selector', 'format'],
      additionalProperties: false,
    },
  ];
}
const SCHEMA: JSONSchema.JSONSchema4 = {
  type: 'array',
  minItems: 1,
  items: {
    oneOf: [
      ...selectorSchema('default', false),
      ...selectorSchema('variable', true),
      ...selectorSchema('function', false),
      ...selectorSchema('parameter', true),
      ...selectorSchema('property', true, [
        'private',
        'protected',
        'public',
        'static',
        'readonly',
        'abstract',
      ]),
      ...selectorSchema('parameterProperty', true, [
        'private',
        'protected',
        'public',
        'readonly',
      ]),
      ...selectorSchema('method', false, [
        'private',
        'protected',
        'public',
        'static',
        'abstract',
      ]),
      ...selectorSchema('accessor', true, [
        'private',
        'protected',
        'public',
        'static',
        'abstract',
      ]),
      ...selectorSchema('enumMember', false),
      ...selectorSchema('class', false, ['abstract']),
      ...selectorSchema('interface', false),
      ...selectorSchema('typeAlias', false),
      ...selectorSchema('typeParameter', false),
      ...selectorSchema('enum', false),
    ],
  },
  additionalItems: false,
};

// #endregion Schema Config

export default util.createRule<Options, MessageIds>({
  name: 'naming-convention',
  meta: {
    docs: {
      category: 'Variables',
      description: '',
      recommended: false,
    },
    type: 'suggestion',
    messages: {
      unexpectedUnderscore:
        '{{type}} name {{name}} must not have a {{position}} underscore.',
      missingUnderscore:
        '{{type}} name {{name}} must have a {{position}} underscore',
      missingAffix:
        '{{type}} name {{name}} must have one of the following {{position}}es: {{affixes}}',
      doesNotMatchFormat:
        '{{type}} name {{name}} must match one of the following formats: {{formats}}',
    },
    schema: SCHEMA,
  },
  defaultOptions: [],
  create(context) {
    const validators = parseOptions(context);

    function handleMember(
      validator: ValidatiorFunction | null,
      node:
        | TSESTree.Property
        | TSESTree.ClassProperty
        | TSESTree.TSAbstractClassProperty
        | TSESTree.TSPropertySignature
        | TSESTree.MethodDefinition
        | TSESTree.TSAbstractMethodDefinition
        | TSESTree.TSMethodSignature,
      modifiers: Set<Modifiers>,
    ): void {
      if (!validator) {
        return;
      }

      const key = node.key;
      /* istanbul ignore if */ if (!util.isLiteralOrIdentifier(key)) {
        // shouldn't happen due to the selectors that are used
        return;
      }

      validator(key, modifiers);
    }

    function getMemberModifiers(
      node:
        | TSESTree.ClassProperty
        | TSESTree.TSAbstractClassProperty
        | TSESTree.MethodDefinition
        | TSESTree.TSAbstractMethodDefinition,
    ): Set<Modifiers> {
      const modifiers = new Set<Modifiers>();
      if (node.accessibility) {
        modifiers.add(node.accessibility);
      } else {
        modifiers.add('public');
      }
      if (node.static) {
        modifiers.add('static');
      }
      if ('readonly' in node && node.readonly) {
        modifiers.add('readonly');
      }
      if (
        node.type === AST_NODE_TYPES.TSAbstractClassProperty ||
        node.type === AST_NODE_TYPES.TSAbstractMethodDefinition
      ) {
        modifiers.add('abstract');
      }

      return modifiers;
    }

    return {
      // #region variable

      VariableDeclarator(node: TSESTree.VariableDeclarator): void {
        const validator = validators.variable;
        if (!validator) {
          return;
        }

        const identifiers: TSESTree.Identifier[] = [];
        getIdentifiersFromPattern(node.id, identifiers);

        identifiers.forEach(i => {
          validator(i);
        });
      },

      // #endregion

      // #region function

      'FunctionDeclaration, TSDeclareFunction, FunctionExpression'(
        node:
          | TSESTree.FunctionDeclaration
          | TSESTree.TSDeclareFunction
          | TSESTree.FunctionExpression,
      ): void {
        const validator = validators.function;
        if (!validator || node.id === null) {
          return;
        }

        validator(node.id);
      },

      // #endregion function

      // #region parameter

      'FunctionDeclaration, TSDeclareFunction, FunctionExpression, ArrowFunctionExpression'(
        node:
          | TSESTree.FunctionDeclaration
          | TSESTree.FunctionExpression
          | TSESTree.ArrowFunctionExpression,
      ): void {
        const validator = validators.parameter;
        if (!validator) {
          return;
        }

        node.params.forEach(param => {
          if (param.type === AST_NODE_TYPES.TSParameterProperty) {
            return;
          }

          const identifiers: TSESTree.Identifier[] = [];
          getIdentifiersFromPattern(param, identifiers);

          identifiers.forEach(i => {
            validator(i);
          });
        });
      },

      // #endregion parameter

      // #region parameterProperty

      TSParameterProperty(node): void {
        const validator = validators.parameterProperty;
        if (!validator) {
          return;
        }

        const modifiers = new Set<Modifiers>();
        if (node.accessibility !== undefined) {
          modifiers.add(node.accessibility);
        } else {
          modifiers.add('public');
        }
        if (node.readonly) {
          modifiers.add('readonly');
        }

        const identifiers: TSESTree.Identifier[] = [];
        getIdentifiersFromPattern(node.parameter, identifiers);

        identifiers.forEach(i => {
          validator(i, modifiers);
        });
      },

      // #endregion parameterProperty

      // #region property

      'Property[computed = false][kind = "init"][value.type != "ArrowFunctionExpression"][value.type != "FunctionExpression"][value.type != "TSEmptyBodyFunctionExpression"]'(
        node: TSESTree.Property,
      ): void {
        const modifiers = new Set<Modifiers>(['public']);
        handleMember(validators.property, node, modifiers);
      },

      [[
        'ClassProperty[computed = false][value.type != "ArrowFunctionExpression"][value.type != "FunctionExpression"][value.type != "TSEmptyBodyFunctionExpression"]',
        'TSAbstractClassProperty[computed = false][value.type != "ArrowFunctionExpression"][value.type != "FunctionExpression"][value.type != "TSEmptyBodyFunctionExpression"]',
      ].join(', ')](
        node: TSESTree.ClassProperty | TSESTree.TSAbstractClassProperty,
      ): void {
        const modifiers = getMemberModifiers(node);
        handleMember(validators.property, node, modifiers);
      },

      'TSPropertySignature[computed = false]'(
        node: TSESTree.TSPropertySignature,
      ): void {
        const modifiers = new Set<Modifiers>(['public']);
        if (node.readonly) {
          modifiers.add('readonly');
        }

        handleMember(validators.property, node, modifiers);
      },

      // #endregion property

      // #region method

      [[
        'Property[computed = false][kind = "init"][value.type = "ArrowFunctionExpression"]',
        'Property[computed = false][kind = "init"][value.type = "FunctionExpression"]',
        'Property[computed = false][kind = "init"][value.type = "TSEmptyBodyFunctionExpression"]',
        'TSMethodSignature[computed = false]',
      ].join(', ')](
        node: TSESTree.Property | TSESTree.TSMethodSignature,
      ): void {
        const modifiers = new Set<Modifiers>(['public']);
        handleMember(validators.method, node, modifiers);
      },

      [[
        'ClassProperty[computed = false][value.type = "ArrowFunctionExpression"]',
        'ClassProperty[computed = false][value.type = "FunctionExpression"]',
        'ClassProperty[computed = false][value.type = "TSEmptyBodyFunctionExpression"]',
        'TSAbstractClassProperty[computed = false][value.type = "ArrowFunctionExpression"]',
        'TSAbstractClassProperty[computed = false][value.type = "FunctionExpression"]',
        'TSAbstractClassProperty[computed = false][value.type = "TSEmptyBodyFunctionExpression"]',
        'MethodDefinition[computed = false][kind = "method"]',
        'TSAbstractMethodDefinition[computed = false][kind = "method"]',
      ].join(', ')](
        node:
          | TSESTree.ClassProperty
          | TSESTree.TSAbstractClassProperty
          | TSESTree.MethodDefinition
          | TSESTree.TSAbstractMethodDefinition,
      ): void {
        const modifiers = getMemberModifiers(node);
        handleMember(validators.method, node, modifiers);
      },

      // #endregion method

      // #region accessor

      [[
        'Property[computed = false][kind = "get"]',
        'Property[computed = false][kind = "set"]',
      ].join(', ')](node: TSESTree.Property): void {
        const modifiers = new Set<Modifiers>(['public']);
        handleMember(validators.accessor, node, modifiers);
      },

      [[
        'MethodDefinition[computed = false][kind = "get"]',
        'MethodDefinition[computed = false][kind = "set"]',
      ].join(', ')](node: TSESTree.MethodDefinition): void {
        const modifiers = getMemberModifiers(node);
        handleMember(validators.accessor, node, modifiers);
      },

      // #endregion accessor

      // #region enumMember

      TSEnumMember(node): void {
        const validator = validators.enumMember;
        if (!validator) {
          return;
        }

        const id = node.id;
        /* istanbul ignore if */ if (!util.isLiteralOrIdentifier(id)) {
          // shouldn't happen in reality because it's not semantically valid code
          return;
        }

        validator(id);
      },

      // #endregion enumMember
    };
  },
});

function getIdentifiersFromPattern(
  pattern: TSESTree.DestructuringPattern,
  identifiers: TSESTree.Identifier[],
): void {
  switch (pattern.type) {
    case AST_NODE_TYPES.Identifier:
      identifiers.push(pattern);
      break;

    case AST_NODE_TYPES.ArrayPattern:
      pattern.elements.forEach(element => {
        getIdentifiersFromPattern(element, identifiers);
      });
      break;

    case AST_NODE_TYPES.ObjectPattern:
      pattern.properties.forEach(property => {
        if (property.type === AST_NODE_TYPES.RestElement) {
          getIdentifiersFromPattern(property, identifiers);
        } else {
          // this is a bit weird, but it's because ESTree doesn't have a new node type
          // for object destructuring properties - it just reuses Property...
          // https://github.com/estree/estree/blob/9ae284b71130d53226e7153b42f01bf819e6e657/es2015.md#L206-L211
          // However, the parser guarantees this is safe (and there is error handling)
          getIdentifiersFromPattern(
            property.value as TSESTree.DestructuringPattern,
            identifiers,
          );
        }
      });
      break;

    case AST_NODE_TYPES.RestElement:
      getIdentifiersFromPattern(pattern.argument, identifiers);
      break;

    case AST_NODE_TYPES.AssignmentPattern:
      getIdentifiersFromPattern(pattern.left, identifiers);
      break;

    case AST_NODE_TYPES.MemberExpression:
      // ignore member expressions, as the everything must already be defined
      break;

    default:
      // https://github.com/typescript-eslint/typescript-eslint/issues/1282
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      throw new Error(`Unexpected pattern type ${pattern!.type}`);
  }
}

type ValidatiorFunction = (
  node: TSESTree.Identifier | TSESTree.Literal,
  modifiers?: Set<Modifiers>,
) => void;
type ParsedOptions = Record<NonDefaultSelectors, null | ValidatiorFunction>;
type Context = TSESLint.RuleContext<MessageIds, Options>;
type Config = NormalizedSelector<Selectors>;
function parseOptions(context: Context): ParsedOptions {
  const groupedOptions = new Map<NonDefaultSelectors, Config[]>();
  const defaultConfig: NormalizedSelector<'default'>[] = [];
  context.options.forEach(option => {
    const normalized = normalizeOption(option);
    if (option.selector === 'default') {
      defaultConfig.push(normalized as NormalizedSelector<'default'>);
    } else {
      const selectors = groupedOptions.get(option.selector) ?? [];
      selectors.push(normalized);
      groupedOptions.set(option.selector, selectors);
    }
  });

  const parsedOptions: ParsedOptions = {
    variable: null,
    function: null,
    parameter: null,
    property: null,
    parameterProperty: null,
    enumMember: null,
    method: null,
    accessor: null,
    class: null,
    interface: null,
    typeAlias: null,
    typeParameter: null,
    enum: null,
  };
  const selectorTypes = Object.keys(parsedOptions) as NonDefaultSelectors[];
  selectorTypes.forEach(type => {
    const validators = groupedOptions.get(type);
    if (validators) {
      parsedOptions[type] = createValidator(type, context, validators);
    } else if (defaultConfig.length > 0) {
      parsedOptions[type] = createValidator(type, context, defaultConfig);
    }
  });

  return parsedOptions;
}
function createValidator(
  type: Selectors,
  context: Context,
  configs: Config[],
): (node: TSESTree.Identifier | TSESTree.Literal) => void {
  // make sure the "highest priority" configs are checked first
  configs = [...configs].sort((a, b) => b.weight - a.weight);

  return (
    node: TSESTree.Identifier | TSESTree.Literal,
    modifiers: Set<Modifiers> = new Set<Modifiers>(),
  ): void => {
    // return will break the loop and stop checking configs
    // it is only used when the name is known to have failed a config.
    const originalName =
      node.type === AST_NODE_TYPES.Identifier ? node.name : `${node.value}`;

    for (const config of configs) {
      if (config.filter?.test(originalName)) {
        // name does not match the filter
        continue;
      }

      if (config.modifiers?.some(modifier => !modifiers.has(modifier))) {
        // does not have the required modifiers
        continue;
      }

      let name: string | null = originalName;

      name = validateUnderscore('leading', config, name, node, originalName);
      if (name === null) {
        return;
      }

      name = validateUnderscore('trailing', config, name, node, originalName);
      if (name === null) {
        return;
      }

      name = validateAffix('prefix', config, name, node, originalName);
      if (name === null) {
        return;
      }

      name = validateAffix('suffix', config, name, node, originalName);
      if (name === null) {
        return;
      }

      if (!validatePredefinedFormat(config, name, node, originalName)) {
        return;
      }

      // it's valid for this config, so we don't need to check any more configs
      return;
    }
  };

  /**
   * @returns the name with the underscore removed, if it is valid according to the specified underscore option, null otherwise
   */
  function validateUnderscore(
    position: 'leading' | 'trailing',
    config: Config,
    name: string,
    node: TSESTree.Identifier | TSESTree.Literal,
    originalName: string,
  ): string | null {
    const option =
      position === 'leading'
        ? config.leadingUnderscore
        : config.trailingUnderscore;
    if (!option) {
      return name;
    }

    const hasUnderscore =
      position === 'leading' ? name.startsWith('_') : name.endsWith('_');
    const trimUnderscore =
      position === 'leading'
        ? (): string => name.slice(1)
        : (): string => name.slice(0, -1);

    switch (option) {
      case 'allow':
        // no check - the user doesn't care if it's there or not
        break;

      case 'forbid':
        if (hasUnderscore) {
          context.report({
            node,
            messageId: 'unexpectedUnderscore',
            data: {
              type: selectorTypeToMessageString(type),
              name: originalName,
              position,
            },
          });
          return null;
        }
        break;

      case 'require':
        if (!hasUnderscore) {
          context.report({
            node,
            messageId: 'missingUnderscore',
            data: {
              type: selectorTypeToMessageString(type),
              name: originalName,
              position,
            },
          });
          return null;
        }
    }

    return hasUnderscore ? trimUnderscore() : name;
  }

  /**
   * @returns the name with the affix removed, if it is valid according to the specified affix option, null otherwise
   */
  function validateAffix(
    position: 'prefix' | 'suffix',
    config: Config,
    name: string,
    node: TSESTree.Identifier | TSESTree.Literal,
    originalName: string,
  ): string | null {
    const options = config[position];
    if (!options || options.length === 0) {
      return name;
    }

    for (const option of options) {
      const hasAffix =
        position === 'prefix' ? name.startsWith(option) : name.endsWith(option);
      const trimAffix =
        position === 'prefix'
          ? (): string => name.slice(option.length)
          : (): string => name.slice(0, -option.length);

      if (hasAffix) {
        // matches, so trim it and return
        return trimAffix();
      }
    }

    context.report({
      node,
      messageId: 'missingAffix',
      data: {
        type: selectorTypeToMessageString(type),
        name: originalName,
        position,
        affixes: options.join(', '),
      },
    });
    return null;
  }

  /**
   * @returns true if the name is valid according to the `format` option, false otherwise
   */
  function validatePredefinedFormat(
    config: Config,
    name: string,
    node: TSESTree.Identifier | TSESTree.Literal,
    originalName: string,
  ): boolean {
    if (config.format.length === 0) {
      return true;
    }

    for (const format of config.format) {
      switch (format) {
        case 'PascalCase':
          if (isPascalCase(name)) {
            return true;
          }
          break;

        case 'StrictPascalCase':
          if (isStrictPascalCase(name)) {
            return true;
          }
          break;

        case 'camelCase':
          if (isCamelCase(name)) {
            return true;
          }
          break;

        case 'strictCamelCase':
          if (isStrictCamelCase(name)) {
            return true;
          }
          break;

        case 'UPPER_CASE':
          if (isUpperCase(name)) {
            return true;
          }
          break;

        case 'snake_case':
          if (isSnakeCase(name)) {
            return true;
          }
          break;
      }
    }

    context.report({
      node,
      messageId: 'doesNotMatchFormat',
      data: {
        type: selectorTypeToMessageString(type),
        name: originalName,
        formats: config.format.join(', '),
      },
    });
    return false;
  }
}

// #region Predefined Format Functions

/*
These format functions are taken from tslint-consistent-codestyle/naming-convention:
https://github.com/ajafff/tslint-consistent-codestyle/blob/ab156cc8881bcc401236d999f4ce034b59039e81/rules/namingConventionRule.ts#L603-L645

The licence for the code can be viewed here:
https://github.com/ajafff/tslint-consistent-codestyle/blob/ab156cc8881bcc401236d999f4ce034b59039e81/LICENSE
*/

/*
Why not regex here? Because it's actually really, really difficult to create a regex to handle
all of the unicode cases, and we have many non-english users that use non-english characters.
https://gist.github.com/mathiasbynens/6334847
*/

function isPascalCase(name: string): boolean {
  return (
    name.length === 0 ||
    // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
    (name[0] === name[0].toUpperCase() && !name.includes('_'))
  );
}
function isStrictPascalCase(name: string): boolean {
  return (
    name.length === 0 ||
    // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
    (name[0] === name[0].toUpperCase() && hasStrictCamelHumps(name, true))
  );
}

function isCamelCase(name: string): boolean {
  return (
    name.length === 0 ||
    // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
    (name[0] === name[0].toLowerCase() && !name.includes('_'))
  );
}
function isStrictCamelCase(name: string): boolean {
  return (
    name.length === 0 ||
    // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
    (name[0] === name[0].toLowerCase() && hasStrictCamelHumps(name, false))
  );
}

function hasStrictCamelHumps(name: string, isUpper: boolean): boolean {
  if (name.startsWith('_')) {
    return false;
  }
  for (let i = 1; i < name.length; ++i) {
    if (name[i] === '_') {
      return false;
    }
    if (isUpper === isUppercaseChar(name[i])) {
      if (isUpper) {
        return false;
      }
    } else {
      isUpper = !isUpper;
    }
  }
  return true;
}

function isUppercaseChar(char: string): boolean {
  return char === char.toUpperCase() && char !== char.toLowerCase();
}

function isSnakeCase(name: string): boolean {
  return (
    name.length === 0 ||
    (name === name.toLowerCase() && validateUnderscores(name))
  );
}

function isUpperCase(name: string): boolean {
  return (
    name.length === 0 ||
    (name === name.toUpperCase() && validateUnderscores(name))
  );
}

/** Check for leading trailing and adjacent underscores */
function validateUnderscores(name: string): boolean {
  if (name.startsWith('_')) {
    return false;
  }
  let wasUnderscore = false;
  for (let i = 1; i < name.length; ++i) {
    if (name[i] === '_') {
      if (wasUnderscore) {
        return false;
      }
      wasUnderscore = true;
    } else {
      wasUnderscore = false;
    }
  }
  return !wasUnderscore;
}
// #endregion Predefined Format Functions

function selectorTypeToMessageString(selectorType: Selectors): string {
  const notCamelCase = selectorType.replace(/([A-Z])/g, ' $1');
  return notCamelCase.charAt(0).toUpperCase() + notCamelCase.slice(1);
}

const ModifierWeight = ((): Readonly<
  Record<Modifiers | TypeModifiers, number>
> => {
  let i = 0;
  return {
    // Modifiers
    readonly: 1 << i++,
    static: 1 << i++,
    public: 1 << i++,
    protected: 1 << i++,
    private: 1 << i++,
    abstract: 1 << i++,
    // TypeModifiers
    boolean: 1 << i++,
    string: 1 << i++,
    number: 1 << i++,
    function: 1 << i++,
    array: 1 << i++,
  };
})();
function normalizeOption<TType extends Selectors>(
  option: Selector<TType>,
): NormalizedSelector<TType> {
  let weight = 0;
  option.modifiers?.forEach(mod => {
    weight |= ModifierWeight[mod];
  });
  option.types?.forEach(mod => {
    weight |= ModifierWeight[mod];
  });

  return {
    ...option,
    filter: option.filter !== undefined ? new RegExp(option.filter) : null,
    weight,
  };
}

export {
  MessageIds,
  Modifiers,
  NonDefaultSelectors,
  NormalizedSelector,
  Options,
  PredefinedFormats,
  Selector,
  Selectors,
  selectorTypeToMessageString,
  TypeModifiers,
};
