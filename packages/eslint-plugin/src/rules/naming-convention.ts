import {
  AST_NODE_TYPES,
  JSONSchema,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';
import * as util from '../util';

type MessageIds =
  | 'unexpectedUnderscore'
  | 'missingUnderscore'
  | 'missingAffix'
  | 'satisfyCustom'
  | 'doesNotMatchFormat'
  | 'doesNotMatchFormatTrimmed';

// #region Options Type Config

enum PredefinedFormats {
  camelCase = 1 << 0,
  strictCamelCase = 1 << 1,
  PascalCase = 1 << 2,
  StrictPascalCase = 1 << 3,
  snake_case = 1 << 4,
  UPPER_CASE = 1 << 5,
}
type PredefinedFormatsString = keyof typeof PredefinedFormats;

enum UnderscoreOptions {
  forbid = 1 << 0,
  allow = 1 << 1,
  require = 1 << 2,
}
type UnderscoreOptionsString = keyof typeof UnderscoreOptions;

enum Selectors {
  // variableLike
  variable = 1 << 0,
  function = 1 << 1,
  parameter = 1 << 2,

  // memberLike
  property = 1 << 3,
  parameterProperty = 1 << 4,
  method = 1 << 5,
  accessor = 1 << 6,
  enumMember = 1 << 7,

  // typeLike
  class = 1 << 8,
  interface = 1 << 9,
  typeAlias = 1 << 10,
  enum = 1 << 11,
  typeParameter = 1 << 12,
}
type SelectorsString = keyof typeof Selectors;
const SELECTOR_COUNT = util.getEnumNames(Selectors).length;

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
  const = 1 << 0,
  readonly = 1 << 1,
  static = 1 << 2,
  public = 1 << 3,
  protected = 1 << 4,
  private = 1 << 5,
  abstract = 1 << 6,
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

interface Selector {
  // format options
  format: PredefinedFormatsString[] | null;
  custom?: {
    regex: string;
    match: boolean;
  };
  leadingUnderscore?: UnderscoreOptionsString;
  trailingUnderscore?: UnderscoreOptionsString;
  prefix?: string[];
  suffix?: string[];
  // selector options
  selector:
    | IndividualAndMetaSelectorsString
    | IndividualAndMetaSelectorsString[];
  modifiers?: ModifiersString[];
  types?: TypeModifiersString[];
  filter?:
    | string
    | {
        regex: string;
        match: boolean;
      };
}
interface NormalizedSelector {
  // format options
  format: PredefinedFormats[] | null;
  custom: {
    regex: RegExp;
    match: boolean;
  } | null;
  leadingUnderscore: UnderscoreOptions | null;
  trailingUnderscore: UnderscoreOptions | null;
  prefix: string[] | null;
  suffix: string[] | null;
  // selector options
  selector: Selectors | MetaSelectors;
  modifiers: Modifiers[] | null;
  types: TypeModifiers[] | null;
  filter: {
    regex: RegExp;
    match: boolean;
  } | null;
  // calculated ordering weight based on modifiers
  modifierWeight: number;
}

// Note that this intentionally does not strictly type the modifiers/types properties.
// This is because doing so creates a huge headache, as the rule's code doesn't need to care.
// The JSON Schema strictly types these properties, so we know the user won't input invalid config.
type Options = Selector[];

// #endregion Options Type Config

// #region Schema Config

const UNDERSCORE_SCHEMA: JSONSchema.JSONSchema4 = {
  type: 'string',
  enum: util.getEnumNames(UnderscoreOptions),
};
const PREFIX_SUFFIX_SCHEMA: JSONSchema.JSONSchema4 = {
  type: 'array',
  items: {
    type: 'string',
    minLength: 1,
  },
  additionalItems: false,
};
const MATCH_REGEX_SCHEMA: JSONSchema.JSONSchema4 = {
  type: 'object',
  properties: {
    match: { type: 'boolean' },
    regex: { type: 'string' },
  },
  required: ['match', 'regex'],
};
type JSONSchemaProperties = Record<string, JSONSchema.JSONSchema4>;
const FORMAT_OPTIONS_PROPERTIES: JSONSchemaProperties = {
  format: {
    oneOf: [
      {
        type: 'array',
        items: {
          type: 'string',
          enum: util.getEnumNames(PredefinedFormats),
        },
        additionalItems: false,
      },
      {
        type: 'null',
      },
    ],
  },
  custom: MATCH_REGEX_SCHEMA,
  leadingUnderscore: UNDERSCORE_SCHEMA,
  trailingUnderscore: UNDERSCORE_SCHEMA,
  prefix: PREFIX_SUFFIX_SCHEMA,
  suffix: PREFIX_SUFFIX_SCHEMA,
};
function selectorSchema(
  selectorString: IndividualAndMetaSelectorsString,
  allowType: boolean,
  modifiers?: ModifiersString[],
): JSONSchema.JSONSchema4[] {
  const selector: JSONSchemaProperties = {
    filter: {
      oneOf: [
        {
          type: 'string',
          minLength: 1,
        },
        MATCH_REGEX_SCHEMA,
      ],
    },
    selector: {
      type: 'string',
      enum: [selectorString],
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
  if (allowType) {
    selector.types = {
      type: 'array',
      items: {
        type: 'string',
        enum: util.getEnumNames(TypeModifiers),
      },
      additionalItems: false,
    };
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

function selectorsSchema(): JSONSchema.JSONSchema4 {
  return {
    type: 'object',
    properties: {
      ...FORMAT_OPTIONS_PROPERTIES,
      ...{
        filter: {
          oneOf: [
            {
              type: 'string',
              minLength: 1,
            },
            MATCH_REGEX_SCHEMA,
          ],
        },
        selector: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              ...util.getEnumNames(MetaSelectors),
              ...util.getEnumNames(Selectors),
            ],
          },
          additionalItems: false,
        },
      },
    },
    modifiers: {
      type: 'array',
      items: {
        type: 'string',
        enum: util.getEnumNames(Modifiers),
      },
      additionalItems: false,
    },
    types: {
      type: 'array',
      items: {
        type: 'string',
        enum: util.getEnumNames(TypeModifiers),
      },
      additionalItems: false,
    },
    required: ['selector', 'format'],
    additionalProperties: false,
  };
}
const SCHEMA: JSONSchema.JSONSchema4 = {
  type: 'array',
  items: {
    oneOf: [
      selectorsSchema(),
      ...selectorSchema('default', false, util.getEnumNames(Modifiers)),

      ...selectorSchema('variableLike', false),
      ...selectorSchema('variable', true, ['const']),
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

// This essentially mirrors ESLint's `camelcase` rule
// note that that rule ignores leading and trailing underscores and only checks those in the middle of a variable name
const defaultCamelCaseAllTheThingsConfig: Options = [
  {
    selector: 'default',
    format: ['camelCase'],
    leadingUnderscore: 'allow',
    trailingUnderscore: 'allow',
  },

  {
    selector: 'variable',
    format: ['camelCase', 'UPPER_CASE'],
    leadingUnderscore: 'allow',
    trailingUnderscore: 'allow',
  },

  {
    selector: 'typeLike',
    format: ['PascalCase'],
  },
];

export default util.createRule<Options, MessageIds>({
  name: 'naming-convention',
  meta: {
    docs: {
      category: 'Variables',
      description:
        'Enforces naming conventions for everything across a codebase',
      recommended: false,
      // technically only requires type checking if the user uses "type" modifiers
      requiresTypeChecking: true,
    },
    type: 'suggestion',
    messages: {
      unexpectedUnderscore:
        '{{type}} name `{{name}}` must not have a {{position}} underscore.',
      missingUnderscore:
        '{{type}} name `{{name}}` must have a {{position}} underscore.',
      missingAffix:
        '{{type}} name `{{name}}` must have one of the following {{position}}es: {{affixes}}',
      satisfyCustom:
        '{{type}} name `{{name}}` must {{regexMatch}} the RegExp: {{regex}}',
      doesNotMatchFormat:
        '{{type}} name `{{name}}` must match one of the following formats: {{formats}}',
      doesNotMatchFormatTrimmed:
        '{{type}} name `{{name}}` trimmed as `{{processedName}}` must match one of the following formats: {{formats}}',
    },
    schema: SCHEMA,
  },
  defaultOptions: defaultCamelCaseAllTheThingsConfig,
  create(contextWithoutDefaults) {
    const context: Context =
      contextWithoutDefaults.options &&
      contextWithoutDefaults.options.length > 0
        ? contextWithoutDefaults
        : // only apply the defaults when the user provides no config
          Object.setPrototypeOf(
            {
              options: defaultCamelCaseAllTheThingsConfig,
            },
            contextWithoutDefaults,
          );

    const validators = parseOptions(context);

    function handleMember(
      validator: ValidatorFunction | null,
      node:
        | TSESTree.PropertyNonComputedName
        | TSESTree.ClassPropertyNonComputedName
        | TSESTree.TSAbstractClassPropertyNonComputedName
        | TSESTree.TSPropertySignatureNonComputedName
        | TSESTree.MethodDefinitionNonComputedName
        | TSESTree.TSAbstractMethodDefinitionNonComputedName
        | TSESTree.TSMethodSignatureNonComputedName,
      modifiers: Set<Modifiers>,
    ): void {
      if (!validator) {
        return;
      }

      const key = node.key;
      validator(key, modifiers);
    }

    function getMemberModifiers(
      node:
        | TSESTree.ClassProperty
        | TSESTree.TSAbstractClassProperty
        | TSESTree.MethodDefinition
        | TSESTree.TSAbstractMethodDefinition
        | TSESTree.TSParameterProperty,
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

        const modifiers = new Set<Modifiers>();
        const parent = node.parent;
        if (
          parent &&
          parent.type === AST_NODE_TYPES.VariableDeclaration &&
          parent.kind === 'const'
        ) {
          modifiers.add(Modifiers.const);
        }

        identifiers.forEach(i => {
          validator(i, modifiers);
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

        const modifiers = getMemberModifiers(node);

        const identifiers: TSESTree.Identifier[] = [];
        getIdentifiersFromPattern(node.parameter, identifiers);

        identifiers.forEach(i => {
          validator(i, modifiers);
        });
      },

      // #endregion parameterProperty

      // #region property

      'Property[computed = false][kind = "init"][value.type != "ArrowFunctionExpression"][value.type != "FunctionExpression"][value.type != "TSEmptyBodyFunctionExpression"]'(
        node: TSESTree.PropertyNonComputedName,
      ): void {
        const modifiers = new Set<Modifiers>([Modifiers.public]);
        handleMember(validators.property, node, modifiers);
      },

      ':matches(ClassProperty, TSAbstractClassProperty)[computed = false][value.type != "ArrowFunctionExpression"][value.type != "FunctionExpression"][value.type != "TSEmptyBodyFunctionExpression"]'(
        node:
          | TSESTree.ClassPropertyNonComputedName
          | TSESTree.TSAbstractClassPropertyNonComputedName,
      ): void {
        const modifiers = getMemberModifiers(node);
        handleMember(validators.property, node, modifiers);
      },

      'TSPropertySignature[computed = false]'(
        node: TSESTree.TSPropertySignatureNonComputedName,
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
        node:
          | TSESTree.PropertyNonComputedName
          | TSESTree.TSMethodSignatureNonComputedName,
      ): void {
        const modifiers = new Set<Modifiers>([Modifiers.public]);
        handleMember(validators.method, node, modifiers);
      },

      [[
        ':matches(ClassProperty, TSAbstractClassProperty)[computed = false][value.type = "ArrowFunctionExpression"]',
        ':matches(ClassProperty, TSAbstractClassProperty)[computed = false][value.type = "FunctionExpression"]',
        ':matches(ClassProperty, TSAbstractClassProperty)[computed = false][value.type = "TSEmptyBodyFunctionExpression"]',
        ':matches(MethodDefinition, TSAbstractMethodDefinition)[computed = false][kind = "method"]',
      ].join(', ')](
        node:
          | TSESTree.ClassPropertyNonComputedName
          | TSESTree.TSAbstractClassPropertyNonComputedName
          | TSESTree.MethodDefinitionNonComputedName
          | TSESTree.TSAbstractMethodDefinitionNonComputedName,
      ): void {
        const modifiers = getMemberModifiers(node);
        handleMember(validators.method, node, modifiers);
      },

      // #endregion method

      // #region accessor

      'Property[computed = false]:matches([kind = "get"], [kind = "set"])'(
        node: TSESTree.PropertyNonComputedName,
      ): void {
        const modifiers = new Set<Modifiers>([Modifiers.public]);
        handleMember(validators.accessor, node, modifiers);
      },

      'MethodDefinition[computed = false]:matches([kind = "get"], [kind = "set"])'(
        node: TSESTree.MethodDefinitionNonComputedName,
      ): void {
        const modifiers = getMemberModifiers(node);
        handleMember(validators.accessor, node, modifiers);
      },

      // #endregion accessor

      // #region enumMember

      // computed is optional, so can't do [computed = false]
      'TSEnumMember[computed != true]'(
        node: TSESTree.TSEnumMemberNonComputedName,
      ): void {
        const validator = validators.enumMember;
        if (!validator) {
          return;
        }

        const id = node.id;
        validator(id);
      },

      // #endregion enumMember

      // #region class

      'ClassDeclaration, ClassExpression'(
        node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
      ): void {
        const validator = validators.class;
        if (!validator) {
          return;
        }

        const id = node.id;
        if (id === null) {
          return;
        }

        const modifiers = new Set<Modifiers>();
        if (node.abstract) {
          modifiers.add(Modifiers.abstract);
        }

        validator(id, modifiers);
      },

      // #endregion class

      // #region interface

      TSInterfaceDeclaration(node): void {
        const validator = validators.interface;
        if (!validator) {
          return;
        }

        validator(node.id);
      },

      // #endregion interface

      // #region typeAlias

      TSTypeAliasDeclaration(node): void {
        const validator = validators.typeAlias;
        if (!validator) {
          return;
        }

        validator(node.id);
      },

      // #endregion typeAlias

      // #region enum

      TSEnumDeclaration(node): void {
        const validator = validators.enum;
        if (!validator) {
          return;
        }

        validator(node.id);
      },

      // #endregion enum

      // #region typeParameter

      'TSTypeParameterDeclaration > TSTypeParameter'(
        node: TSESTree.TSTypeParameter,
      ): void {
        const validator = validators.typeParameter;
        if (!validator) {
          return;
        }

        validator(node.name);
      },

      // #endregion typeParameter
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
        if (element !== null) {
          getIdentifiersFromPattern(element, identifiers);
        }
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

type ValidatorFunction = (
  node: TSESTree.Identifier | TSESTree.Literal,
  modifiers?: Set<Modifiers>,
) => void;
type ParsedOptions = Record<SelectorsString, null | ValidatorFunction>;
type Context = Readonly<TSESLint.RuleContext<MessageIds, Options>>;

function parseOptions(context: Context): ParsedOptions {
  const normalizedOptions = context.options.map(opt => normalizeOption(opt));
  return util.getEnumNames(Selectors).reduce((acc, k) => {
    acc[k] = createValidator(k, context, normalizedOptions);
    return acc;
  }, {} as ParsedOptions);
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
        // in the event of the same selector, order by modifier weight
        // sort descending - the type modifiers are "more important"
        return b.modifierWeight - a.modifierWeight;
      }

      /*
      meta selectors will always be larger numbers than the normal selectors they contain, as they are the sum of all
      of the selectors that they contain.
      to give normal selectors a higher priority, shift them all SELECTOR_COUNT bits to the left before comparison, so
      they are instead always guaranteed to be larger than the meta selectors.
      */
      const aSelector = isMetaSelector(a.selector)
        ? a.selector
        : a.selector << SELECTOR_COUNT;
      const bSelector = isMetaSelector(b.selector)
        ? b.selector
        : b.selector << SELECTOR_COUNT;

      // sort descending - the meta selectors are "least important"
      return bSelector - aSelector;
    });

  return (
    node: TSESTree.Identifier | TSESTree.Literal,
    modifiers: Set<Modifiers> = new Set<Modifiers>(),
  ): void => {
    const originalName =
      node.type === AST_NODE_TYPES.Identifier ? node.name : `${node.value}`;

    // return will break the loop and stop checking configs
    // it is only used when the name is known to have failed or succeeded a config.
    for (const config of configs) {
      if (config.filter?.regex.test(originalName) !== config.filter?.match) {
        // name does not match the filter
        continue;
      }

      if (config.modifiers?.some(modifier => !modifiers.has(modifier))) {
        // does not have the required modifiers
        continue;
      }

      if (!isCorrectType(node, config, context)) {
        // is not the correct type
        continue;
      }

      let name: string | null = originalName;

      name = validateUnderscore('leading', config, name, node, originalName);
      if (name === null) {
        // fail
        return;
      }

      name = validateUnderscore('trailing', config, name, node, originalName);
      if (name === null) {
        // fail
        return;
      }

      name = validateAffix('prefix', config, name, node, originalName);
      if (name === null) {
        // fail
        return;
      }

      name = validateAffix('suffix', config, name, node, originalName);
      if (name === null) {
        // fail
        return;
      }

      if (!validateCustom(config, name, node, originalName)) {
        // fail
        return;
      }

      if (!validatePredefinedFormat(config, name, node, originalName)) {
        // fail
        return;
      }

      // it's valid for this config, so we don't need to check any more configs
      return;
    }
  };

  // centralizes the logic for formatting the report data
  function formatReportData({
    affixes,
    formats,
    originalName,
    processedName,
    position,
    custom,
  }: {
    affixes?: string[];
    formats?: PredefinedFormats[];
    originalName: string;
    processedName?: string;
    position?: 'leading' | 'trailing' | 'prefix' | 'suffix';
    custom?: NonNullable<NormalizedSelector['custom']>;
  }): Record<string, unknown> {
    return {
      type: selectorTypeToMessageString(type),
      name: originalName,
      processedName,
      position,
      affixes: affixes?.join(', '),
      formats: formats?.map(f => PredefinedFormats[f]).join(', '),
      regex: custom?.regex?.toString(),
      regexMatch:
        custom?.match === true
          ? 'match'
          : custom?.match === false
          ? 'not match'
          : null,
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
      case UnderscoreOptions.allow:
        // no check - the user doesn't care if it's there or not
        break;

      case UnderscoreOptions.forbid:
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

      case UnderscoreOptions.require:
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
   * @returns true if the name is valid according to the `regex` option, false otherwise
   */
  function validateCustom(
    config: NormalizedSelector,
    name: string,
    node: TSESTree.Identifier | TSESTree.Literal,
    originalName: string,
  ): boolean {
    const custom = config.custom;
    if (!custom) {
      return true;
    }

    const result = custom.regex.test(name);
    if (custom.match && result) {
      return true;
    }
    if (!custom.match && !result) {
      return true;
    }

    context.report({
      node,
      messageId: 'satisfyCustom',
      data: formatReportData({
        originalName,
        custom,
      }),
    });
    return false;
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
    if (formats === null || formats.length === 0) {
      return true;
    }

    for (const format of formats) {
      const checker = PredefinedFormatToCheckFunction[format];
      if (checker(name)) {
        return true;
      }
    }

    context.report({
      node,
      messageId:
        originalName === name
          ? 'doesNotMatchFormat'
          : 'doesNotMatchFormatTrimmed',
      data: formatReportData({
        originalName,
        processedName: name,
        formats,
      }),
    });
    return false;
  }
}

// #region Predefined Format Functions

/*
These format functions are taken from `tslint-consistent-codestyle/naming-convention`:
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
    (name[0] === name[0].toUpperCase() && !name.includes('_'))
  );
}
function isStrictPascalCase(name: string): boolean {
  return (
    name.length === 0 ||
    (name[0] === name[0].toUpperCase() && hasStrictCamelHumps(name, true))
  );
}

function isCamelCase(name: string): boolean {
  return (
    name.length === 0 ||
    (name[0] === name[0].toLowerCase() && !name.includes('_'))
  );
}
function isStrictCamelCase(name: string): boolean {
  return (
    name.length === 0 ||
    (name[0] === name[0].toLowerCase() && hasStrictCamelHumps(name, false))
  );
}

function hasStrictCamelHumps(name: string, isUpper: boolean): boolean {
  function isUppercaseChar(char: string): boolean {
    return char === char.toUpperCase() && char !== char.toLowerCase();
  }

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

const PredefinedFormatToCheckFunction: Readonly<Record<
  PredefinedFormats,
  (name: string) => boolean
>> = {
  [PredefinedFormats.PascalCase]: isPascalCase,
  [PredefinedFormats.StrictPascalCase]: isStrictPascalCase,
  [PredefinedFormats.camelCase]: isCamelCase,
  [PredefinedFormats.strictCamelCase]: isStrictCamelCase,
  [PredefinedFormats.UPPER_CASE]: isUpperCase,
  [PredefinedFormats.snake_case]: isSnakeCase,
};

// #endregion Predefined Format Functions

function selectorTypeToMessageString(selectorType: SelectorsString): string {
  const notCamelCase = selectorType.replace(/([A-Z])/g, ' $1');
  return notCamelCase.charAt(0).toUpperCase() + notCamelCase.slice(1);
}

function isMetaSelector(
  selector: IndividualAndMetaSelectorsString | Selectors | MetaSelectors,
): selector is MetaSelectorsString {
  return selector in MetaSelectors;
}
function normalizeOption(option: Selector): NormalizedSelector {
  let weight = 0;
  option.modifiers?.forEach(mod => {
    weight |= Modifiers[mod];
  });
  option.types?.forEach(mod => {
    weight |= TypeModifiers[mod];
  });

  // give selectors with a filter the _highest_ priority
  if (option.filter) {
    weight |= 1 << 30;
  }

  const normalizedOption = {
    // format options
    format: option.format ? option.format.map(f => PredefinedFormats[f]) : null,
    custom: option.custom
      ? {
          regex: new RegExp(option.custom.regex, 'u'),
          match: option.custom.match,
        }
      : null,
    leadingUnderscore:
      option.leadingUnderscore !== undefined
        ? UnderscoreOptions[option.leadingUnderscore]
        : null,
    trailingUnderscore:
      option.trailingUnderscore !== undefined
        ? UnderscoreOptions[option.trailingUnderscore]
        : null,
    prefix: option.prefix && option.prefix.length > 0 ? option.prefix : null,
    suffix: option.suffix && option.suffix.length > 0 ? option.suffix : null,
    modifiers: option.modifiers?.map(m => Modifiers[m]) ?? null,
    types: option.types?.map(m => TypeModifiers[m]) ?? null,
    filter:
      option.filter !== undefined
        ? typeof option.filter === 'string'
          ? { regex: new RegExp(option.filter, 'u'), match: true }
          : {
              regex: new RegExp(option.filter.regex, 'u'),
              match: option.filter.match,
            }
        : null,
    // calculated ordering weight based on modifiers
    modifierWeight: weight,
  };

  const selectors = Array.isArray(option.selector)
    ? option.selector
    : [option.selector];

  return {
    selector: selectors
      .map(selector =>
        isMetaSelector(selector)
          ? MetaSelectors[selector]
          : Selectors[selector],
      )
      .reduce((accumulator, selector) => accumulator | selector),
    ...normalizedOption,
  };
}

function isCorrectType(
  node: TSESTree.Node,
  config: NormalizedSelector,
  context: Context,
): boolean {
  if (config.types === null) {
    return true;
  }

  const { esTreeNodeToTSNodeMap, program } = util.getParserServices(context);
  const checker = program.getTypeChecker();
  const tsNode = esTreeNodeToTSNodeMap.get(node);
  const type = checker
    .getTypeAtLocation(tsNode)
    // remove null and undefined from the type, as we don't care about it here
    .getNonNullableType();

  for (const allowedType of config.types) {
    switch (allowedType) {
      case TypeModifiers.array:
        if (
          isAllTypesMatch(
            type,
            t => checker.isArrayType(t) || checker.isTupleType(t),
          )
        ) {
          return true;
        }
        break;

      case TypeModifiers.function:
        if (isAllTypesMatch(type, t => t.getCallSignatures().length > 0)) {
          return true;
        }
        break;

      case TypeModifiers.boolean:
      case TypeModifiers.number:
      case TypeModifiers.string: {
        const typeString = checker.typeToString(
          // this will resolve things like true => boolean, 'a' => string and 1 => number
          checker.getWidenedType(checker.getBaseTypeOfLiteralType(type)),
        );
        const allowedTypeString = TypeModifiers[allowedType];
        if (typeString === allowedTypeString) {
          return true;
        }
        break;
      }
    }
  }

  return false;
}

/**
 * @returns `true` if the type (or all union types) in the given type return true for the callback
 */
function isAllTypesMatch(
  type: ts.Type,
  cb: (type: ts.Type) => boolean,
): boolean {
  if (type.isUnion()) {
    return type.types.every(t => cb(t));
  }

  return cb(type);
}

export {
  MessageIds,
  Options,
  PredefinedFormatsString,
  Selector,
  selectorTypeToMessageString,
};
