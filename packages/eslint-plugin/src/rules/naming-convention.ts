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

enum PredefinedFormats {
  camelCase = 1 << 0,
  strictCamelCase = 1 << 1,
  PascalCase = 1 << 2,
  StrictPascalCase = 1 << 3,
  UPPER_CASE = 1 << 4,
  // eslint-disable-next-line @typescript-eslint/camelcase
  snake_case = 1 << 5,
}
type PredefinedFormatsString = keyof typeof PredefinedFormats;

enum UnderscroreOptions {
  forbid = 1 << 0,
  allow = 1 << 1,
  require = 1 << 2,
}
type UnderscroreOptionsString = keyof typeof UnderscroreOptions;

enum Selectors {
  // variableLike
  variable = 1 << 0,
  function = 1 << 1,
  parameter = 1 << 2,

  // memberLike
  property = 1 << 3,
  parameterProperty = 1 << 4,
  enumMember = 1 << 5,
  method = 1 << 6,
  accessor = 1 << 7,

  // typeLike
  class = 1 << 8,
  interface = 1 << 9,
  typeAlias = 1 << 10,
  enum = 1 << 11,
  typeParameter = 1 << 12,
}
type SelectorsString = keyof typeof Selectors;

enum MetaSelectors {
  default = -1,
  variableLike = 0 |
    Selectors.variable |
    Selectors.function |
    Selectors.parameter,
  memberLike = 0 |
    Selectors.property |
    Selectors.parameterProperty |
    Selectors.enumMember |
    Selectors.method |
    Selectors.accessor,
  typeLike = 0 |
    Selectors.class |
    Selectors.interface |
    Selectors.typeAlias |
    Selectors.enum |
    Selectors.typeParameter,
}
type MetaSelectorsString = keyof typeof MetaSelectors;
type IndividualAndMetaSelectorsString = SelectorsString | MetaSelectorsString;

enum Modifiers {
  readonly = 1 << 0,
  static = 1 << 1,
  public = 1 << 2,
  protected = 1 << 3,
  private = 1 << 4,
  abstract = 1 << 5,
}
type ModifiersString = keyof typeof Modifiers;

enum TypeModifiers {
  boolean = 1 << 10,
  string = 1 << 11,
  number = 1 << 12,
  function = 1 << 13,
  array = 1 << 14,
}
type TypeModifiersString = keyof typeof TypeModifiers;

interface Selector<
  TType extends IndividualAndMetaSelectorsString = IndividualAndMetaSelectorsString
> {
  // format options
  leadingUnderscore?: UnderscroreOptionsString;
  trailingUnderscore?: UnderscroreOptionsString;
  prefix?: string[];
  suffix?: string[];
  format: PredefinedFormatsString[];
  // selector options
  selector: TType;
  modifiers?: ModifiersString[];
  types?: TypeModifiersString[];
  filter?: string;
}
interface NormalizedSelector {
  // format options
  leadingUnderscore: UnderscroreOptions | null;
  trailingUnderscore: UnderscroreOptions | null;
  prefix: string[] | null;
  suffix: string[] | null;
  format: PredefinedFormats[];
  // selector options
  selector: Selectors | MetaSelectors;
  modifiers: Modifiers[] | null;
  types: TypeModifiers[] | null;
  filter: RegExp | null;
  // calculated ordering weight based on modifiers
  modifierWeight: number;
}

// Note that this intentionally does not strictly type the modifiers/types properties.
// This is because doing so creates a huge headache, as the rule's code doesn't need to care.
// The JSON Schema strictly types these properties, so we know the user won't input invalid config.
type Options = (
  | // meta selectors
  Selector<'default'>
  | Selector<'variableLike'>
  | Selector<'memberLike'>
  | Selector<'typeLike'>

  // individual selectors
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
  | Selector<'enum'>
  | Selector<'typeParameter'>
)[];

// #endregion Options Type Config

// #region Schema Config

const UNDERSCORE_SCHEMA: JSONSchema.JSONSchema4 = {
  type: 'string',
  enum: util.getEnumNames(UnderscroreOptions),
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
      enum: util.getEnumNames(PredefinedFormats),
    },
    minItems: 1,
    additionalItems: false,
  },
};
const TYPE_MODIFIERS_SCHEMA: JSONSchema.JSONSchema4 = {
  type: 'array',
  items: {
    type: 'string',
    enum: util.getEnumNames(TypeModifiers),
  },
  additionalItems: false,
};
function selectorSchema(
  type: IndividualAndMetaSelectorsString,
  types: boolean,
  modifiers?: ModifiersString[],
): JSONSchema.JSONSchema4[] {
  const selector: JSONSchemaProperties = {
    filter: {
      type: 'string',
      minLength: 1,
    },
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
      ...selectorSchema('default', false, util.getEnumNames(Modifiers)),

      ...selectorSchema('variableLike', false),
      ...selectorSchema('variable', true),
      ...selectorSchema('function', false),
      ...selectorSchema('parameter', true),

      ...selectorSchema('memberLike', false, [
        'private',
        'protected',
        'public',
        'static',
        'readonly',
        'abstract',
      ]),
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

      ...selectorSchema('typeLike', false, ['abstract']),
      ...selectorSchema('class', false, ['abstract']),
      ...selectorSchema('interface', false),
      ...selectorSchema('typeAlias', false),
      ...selectorSchema('enum', false),
      ...selectorSchema('typeParameter', false),
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
        modifiers.add(Modifiers[node.accessibility]);
      } else {
        modifiers.add(Modifiers.public);
      }
      if (node.static) {
        modifiers.add(Modifiers.static);
      }
      if ('readonly' in node && node.readonly) {
        modifiers.add(Modifiers.readonly);
      }
      if (
        node.type === AST_NODE_TYPES.TSAbstractClassProperty ||
        node.type === AST_NODE_TYPES.TSAbstractMethodDefinition
      ) {
        modifiers.add(Modifiers.abstract);
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
          modifiers.add(Modifiers[node.accessibility]);
        } else {
          modifiers.add(Modifiers.public);
        }
        if (node.readonly) {
          modifiers.add(Modifiers.readonly);
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
        const modifiers = new Set<Modifiers>([Modifiers.public]);
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
        const modifiers = new Set<Modifiers>([Modifiers.public]);
        if (node.readonly) {
          modifiers.add(Modifiers.readonly);
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
        const modifiers = new Set<Modifiers>([Modifiers.public]);
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
        const modifiers = new Set<Modifiers>([Modifiers.public]);
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
type ParsedOptions = Record<SelectorsString, null | ValidatiorFunction>;
type Context = TSESLint.RuleContext<MessageIds, Options>;
function parseOptions(context: Context): ParsedOptions {
  const normalizedOptions = context.options.map(opt => normalizeOption(opt));
  const parsedOptions = util.getEnumNames(Selectors).reduce((acc, k) => {
    acc[k] = createValidator(k, context, normalizedOptions);
    return acc;
  }, {} as ParsedOptions);

  return parsedOptions;
}
function createValidator(
  type: SelectorsString,
  context: Context,
  allConfigs: NormalizedSelector[],
): (node: TSESTree.Identifier | TSESTree.Literal) => void {
  // make sure the "highest priority" configs are checked first
  const selectorType = Selectors[type];
  const configs = allConfigs
    // gather all of the applicable selectors
    .filter(
      c =>
        (c.selector & selectorType) !== 0 ||
        c.selector === MetaSelectors.default,
    )
    .sort((a, b) => {
      if (a.selector === b.selector) {
        // in the event of the same selector, order by modifier collection
        return b.modifierWeight - a.modifierWeight;
      }

      // check the meta selectors last
      return b.selector - a.selector;
    });

  return (
    node: TSESTree.Identifier | TSESTree.Literal,
    modifiers: Set<Modifiers> = new Set<Modifiers>(),
  ): void => {
    const originalName =
      node.type === AST_NODE_TYPES.Identifier ? node.name : `${node.value}`;

    // return will break the loop and stop checking configs
    // it is only used when the name is known to have failed a config.
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

  // centralises the logic for formatting the report data
  function formatReportData({
    affixes,
    formats,
    originalName,
    position,
  }: {
    affixes?: string[];
    formats?: PredefinedFormats[];
    originalName: string;
    position?: 'leading' | 'trailing' | 'prefix' | 'suffix';
  }): Record<string, unknown> {
    return {
      type: selectorTypeToMessageString(type),
      name: originalName,
      position,
      affixes: affixes?.join(', '),
      formats: formats?.map(f => PredefinedFormats[f]).join(', '),
    };
  }

  /**
   * @returns the name with the underscore removed, if it is valid according to the specified underscore option, null otherwise
   */
  function validateUnderscore(
    position: 'leading' | 'trailing',
    config: NormalizedSelector,
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
      case UnderscroreOptions.allow:
        // no check - the user doesn't care if it's there or not
        break;

      case UnderscroreOptions.forbid:
        if (hasUnderscore) {
          context.report({
            node,
            messageId: 'unexpectedUnderscore',
            data: formatReportData({
              originalName,
              position,
            }),
          });
          return null;
        }
        break;

      case UnderscroreOptions.require:
        if (!hasUnderscore) {
          context.report({
            node,
            messageId: 'missingUnderscore',
            data: formatReportData({
              originalName,
              position,
            }),
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
    config: NormalizedSelector,
    name: string,
    node: TSESTree.Identifier | TSESTree.Literal,
    originalName: string,
  ): string | null {
    const affixes = config[position];
    if (!affixes || affixes.length === 0) {
      return name;
    }

    for (const affix of affixes) {
      const hasAffix =
        position === 'prefix' ? name.startsWith(affix) : name.endsWith(affix);
      const trimAffix =
        position === 'prefix'
          ? (): string => name.slice(affix.length)
          : (): string => name.slice(0, -affix.length);

      if (hasAffix) {
        // matches, so trim it and return
        return trimAffix();
      }
    }

    context.report({
      node,
      messageId: 'missingAffix',
      data: formatReportData({
        originalName,
        position,
        affixes,
      }),
    });
    return null;
  }

  /**
   * @returns true if the name is valid according to the `format` option, false otherwise
   */
  function validatePredefinedFormat(
    config: NormalizedSelector,
    name: string,
    node: TSESTree.Identifier | TSESTree.Literal,
    originalName: string,
  ): boolean {
    const formats = config.format;
    if (formats.length === 0) {
      return true;
    }

    for (const format of formats) {
      switch (format) {
        case PredefinedFormats.PascalCase:
          if (isPascalCase(name)) {
            return true;
          }
          break;

        case PredefinedFormats.StrictPascalCase:
          if (isStrictPascalCase(name)) {
            return true;
          }
          break;

        case PredefinedFormats.camelCase:
          if (isCamelCase(name)) {
            return true;
          }
          break;

        case PredefinedFormats.strictCamelCase:
          if (isStrictCamelCase(name)) {
            return true;
          }
          break;

        case PredefinedFormats.UPPER_CASE:
          if (isUpperCase(name)) {
            return true;
          }
          break;

        case PredefinedFormats.snake_case:
          if (isSnakeCase(name)) {
            return true;
          }
          break;
      }
    }

    context.report({
      node,
      messageId: 'doesNotMatchFormat',
      data: formatReportData({
        originalName,
        formats,
      }),
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

function selectorTypeToMessageString(selectorType: SelectorsString): string {
  const notCamelCase = selectorType.replace(/([A-Z])/g, ' $1');
  return notCamelCase.charAt(0).toUpperCase() + notCamelCase.slice(1);
}

function isMetaSelector(
  selector: IndividualAndMetaSelectorsString,
): selector is MetaSelectorsString {
  return selector in MetaSelectors;
}
function normalizeOption(
  option: Selector<IndividualAndMetaSelectorsString>,
): NormalizedSelector {
  let weight = 0;
  option.modifiers?.forEach(mod => {
    weight |= Modifiers[mod];
  });
  option.types?.forEach(mod => {
    weight |= TypeModifiers[mod];
  });

  return {
    // format options
    leadingUnderscore:
      option.leadingUnderscore !== undefined
        ? UnderscroreOptions[option.leadingUnderscore]
        : null,
    trailingUnderscore:
      option.trailingUnderscore !== undefined
        ? UnderscroreOptions[option.trailingUnderscore]
        : null,
    prefix: option.prefix ?? null,
    suffix: option.suffix ?? null,
    format: option.format.map(f => PredefinedFormats[f]),
    // selector options
    selector: isMetaSelector(option.selector)
      ? MetaSelectors[option.selector]
      : Selectors[option.selector],
    modifiers: option.modifiers?.map(m => Modifiers[m]) ?? null,
    types: option.types?.map(t => TypeModifiers[t]) ?? null,
    filter: option.filter !== undefined ? new RegExp(option.filter) : null,
    // calculated ordering weight based on modifiers
    modifierWeight: weight,
  };
}

export {
  MessageIds,
  Options,
  PredefinedFormatsString,
  Selector,
  selectorTypeToMessageString,
};
