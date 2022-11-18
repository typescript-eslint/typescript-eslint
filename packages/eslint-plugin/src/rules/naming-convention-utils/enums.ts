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
  // variableLike
  variable = 1 << 0,
  function = 1 << 1,
  parameter = 1 << 2,

  // memberLike
  parameterProperty = 1 << 3,
  accessor = 1 << 4,
  enumMember = 1 << 5,
  classMethod = 1 << 6,
  objectLiteralMethod = 1 << 7,
  typeMethod = 1 << 8,
  classProperty = 1 << 9,
  objectLiteralProperty = 1 << 10,
  typeProperty = 1 << 11,

  // typeLike
  class = 1 << 12,
  interface = 1 << 13,
  typeAlias = 1 << 14,
  enum = 1 << 15,
  typeParameter = 1 << 17,
}
type SelectorsString = keyof typeof Selectors;

enum MetaSelectors {
  default = -1,
  variableLike = 0 |
    Selectors.variable |
    Selectors.function |
    Selectors.parameter,
  memberLike = 0 |
    Selectors.classProperty |
    Selectors.objectLiteralProperty |
    Selectors.typeProperty |
    Selectors.parameterProperty |
    Selectors.enumMember |
    Selectors.classMethod |
    Selectors.objectLiteralMethod |
    Selectors.typeMethod |
    Selectors.accessor,
  typeLike = 0 |
    Selectors.class |
    Selectors.interface |
    Selectors.typeAlias |
    Selectors.enum |
    Selectors.typeParameter,
  method = 0 |
    Selectors.classMethod |
    Selectors.objectLiteralMethod |
    Selectors.typeMethod,
  property = 0 |
    Selectors.classProperty |
    Selectors.objectLiteralProperty |
    Selectors.typeProperty,
}
type MetaSelectorsString = keyof typeof MetaSelectors;
type IndividualAndMetaSelectorsString = SelectorsString | MetaSelectorsString;

enum Modifiers {
  // const variable
  const = 1 << 0,
  // readonly members
  readonly = 1 << 1,
  // static members
  static = 1 << 2,
  // member accessibility
  public = 1 << 3,
  protected = 1 << 4,
  private = 1 << 5,
  abstract = 1 << 6,
  // destructured variable
  destructured = 1 << 7,
  // variables declared in the top-level scope
  global = 1 << 8,
  // things that are exported
  exported = 1 << 9,
  // things that are unused
  unused = 1 << 10,
  // properties that require quoting
  requiresQuotes = 1 << 11,
  // class members that are overridden
  override = 1 << 12,
  // class methods, object function properties, or functions that are async via the `async` keyword
  async = 1 << 13,

  // make sure TypeModifiers starts at Modifiers + 1 or else sorting won't work
}
type ModifiersString = keyof typeof Modifiers;

enum TypeModifiers {
  boolean = 1 << 12,
  string = 1 << 13,
  number = 1 << 14,
  function = 1 << 15,
  array = 1 << 16,
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
