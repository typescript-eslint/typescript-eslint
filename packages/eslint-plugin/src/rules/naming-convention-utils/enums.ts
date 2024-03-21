enum PredefinedFormats {
  camelCase = 1,
  strictCamelCase,
  PascalCase,
  StrictPascalCase,
  snake_case,
  UPPER_CASE,
}
type PredefinedFormatsString = keyof typeof PredefinedFormats;

enum UnderscoreOptions {
  forbid = 1,
  allow,
  require,

  // special cases as it's common practice to use double underscore
  requireDouble,
  allowDouble,
  allowSingleOrDouble,
}
type UnderscoreOptionsString = keyof typeof UnderscoreOptions;

enum Selectors {
  autoAccessor = 1 << 12,
  // typeLike
  class = 1 << 13,
  classMethod = 1 << 6,

  classProperty = 1 << 9,
  classicAccessor = 1 << 4,
  enum = 1 << 16,
  enumMember = 1 << 5,
  function = 1 << 1,
  // other
  import = 1 << 18,
  interface = 1 << 14,
  objectLiteralMethod = 1 << 7,
  objectLiteralProperty = 1 << 10,
  parameter = 1 << 2,

  // memberLike
  parameterProperty = 1 << 3,
  typeAlias = 1 << 15,
  typeMethod = 1 << 8,
  typeParameter = 1 << 17,
  typeProperty = 1 << 11,

  // variableLike
  variable = 1 << 0,
}
type SelectorsString = keyof typeof Selectors;

enum MetaSelectors {
  /* eslint-disable @typescript-eslint/prefer-literal-enum-member */
  accessor = 0 | Selectors.classicAccessor | Selectors.autoAccessor,
  default = -1,
  memberLike = 0 |
    Selectors.classProperty |
    Selectors.objectLiteralProperty |
    Selectors.typeProperty |
    Selectors.parameterProperty |
    Selectors.enumMember |
    Selectors.classMethod |
    Selectors.objectLiteralMethod |
    Selectors.typeMethod |
    Selectors.classicAccessor |
    Selectors.autoAccessor,
  method = 0 |
    Selectors.classMethod |
    Selectors.objectLiteralMethod |
    Selectors.typeMethod,
  property = 0 |
    Selectors.classProperty |
    Selectors.objectLiteralProperty |
    Selectors.typeProperty,
  typeLike = 0 |
    Selectors.class |
    Selectors.interface |
    Selectors.typeAlias |
    Selectors.enum |
    Selectors.typeParameter,
  variableLike = 0 |
    Selectors.variable |
    Selectors.function |
    Selectors.parameter,
  /* eslint-enable @typescript-eslint/prefer-literal-enum-member */
}
type MetaSelectorsString = keyof typeof MetaSelectors;
type IndividualAndMetaSelectorsString = MetaSelectorsString | SelectorsString;

enum Modifiers {
  '#private' = 1 << 6,
  abstract = 1 << 7,
  // class methods, object function properties, or functions that are async via the `async` keyword
  async = 1 << 14,
  // const variable
  const = 1 << 0,
  // default imports
  default = 1 << 15,
  // destructured variable
  destructured = 1 << 8,
  // things that are exported
  exported = 1 << 10,
  // variables declared in the top-level scope
  global = 1 << 9,
  // namespace imports
  namespace = 1 << 16,
  // class members that are overridden
  override = 1 << 13,
  private = 1 << 5,
  protected = 1 << 4,
  // member accessibility
  public = 1 << 3,
  // readonly members
  readonly = 1 << 1,
  // properties that require quoting
  requiresQuotes = 1 << 12,
  // static members
  static = 1 << 2,
  // things that are unused
  unused = 1 << 11,

  // make sure TypeModifiers starts at Modifiers + 1 or else sorting won't work
}
type ModifiersString = keyof typeof Modifiers;

enum TypeModifiers {
  array = 1 << 21,
  boolean = 1 << 17,
  function = 1 << 20,
  number = 1 << 19,
  string = 1 << 18,
}
type TypeModifiersString = keyof typeof TypeModifiers;

export {
  IndividualAndMetaSelectorsString,
  MetaSelectors,
  MetaSelectorsString,
  Modifiers,
  ModifiersString,
  PredefinedFormats,
  PredefinedFormatsString,
  Selectors,
  SelectorsString,
  TypeModifiers,
  TypeModifiersString,
  UnderscoreOptions,
  UnderscoreOptionsString,
};
