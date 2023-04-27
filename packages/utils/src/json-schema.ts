/**
 * This is a fork of https://github.com/DefinitelyTyped/DefinitelyTyped/blob/13f63c2eb8d7479caf01ab8d72f9e3683368a8f5/types/json-schema/index.d.ts
 * We intentionally fork this because:
 * - ESLint ***ONLY*** supports JSONSchema v4
 * - We want to provide stricter types
 *
 * Changes:
 * - Removed loose `[k: string]: any` indexer as it allows for bad, unused properties.
 * - Added `$defs` as an alternate to `definitions`.
 * - strictly typed `formats` for ajv v6
 */

//==================================================================================================
// JSON Schema Draft 04
//==================================================================================================

/**
 * @see https://tools.ietf.org/html/draft-zyp-json-schema-03#section-5.1
 */
export type JSONSchema4TypeName =
  // | 'string'
  // | 'number'
  // | 'integer'
  | 'boolean'
  // | 'object'
  // | 'array'
  | 'null'
  | 'any';

/**
 * @see https://tools.ietf.org/html/draft-zyp-json-schema-04#section-3.5
 */
export type JSONSchema4Type =
  | string
  | number
  | boolean
  | JSONSchema4Object
  | JSONSchema4Array
  | null;

// Workaround for infinite type recursion
export interface JSONSchema4Object {
  [key: string]: JSONSchema4Type;
}

// Workaround for infinite type recursion
// https://github.com/Microsoft/TypeScript/issues/3496#issuecomment-128553540
export interface JSONSchema4Array extends Array<JSONSchema4Type> {}

/**
 * Meta schema
 *
 * Recommended values:
 * - 'http://json-schema.org/schema#'
 * - 'http://json-schema.org/hyper-schema#'
 * - 'http://json-schema.org/draft-04/schema#'
 * - 'http://json-schema.org/draft-04/hyper-schema#'
 * - 'http://json-schema.org/draft-03/schema#'
 * - 'http://json-schema.org/draft-03/hyper-schema#'
 *
 * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-5
 */
export type JSONSchema4Version = string;

/**
 * JSON Schema V4
 * @see https://tools.ietf.org/html/draft-zyp-json-schema-04
 */
export interface JSONSchema4 {
  id?: string | undefined;
  $ref?: string | undefined;
  $schema?: JSONSchema4Version | undefined;

  /**
   * This attribute is a string that provides a short description of the
   * instance property.
   *
   * @see https://tools.ietf.org/html/draft-zyp-json-schema-03#section-5.21
   */
  title?: string | undefined;

  /**
   * This attribute is a string that provides a full description of the of
   * purpose the instance property.
   *
   * @see https://tools.ietf.org/html/draft-zyp-json-schema-03#section-5.22
   */
  description?: string | undefined;

  default?: JSONSchema4Type | undefined;
  multipleOf?: number | undefined;
  maximum?: number | undefined;
  exclusiveMaximum?: boolean | undefined;
  minimum?: number | undefined;
  exclusiveMinimum?: boolean | undefined;
  maxLength?: number | undefined;
  minLength?: number | undefined;
  pattern?: string | undefined;

  /**
   * May only be defined when "items" is defined, and is a tuple of JSONSchemas.
   *
   * This provides a definition for additional items in an array instance
   * when tuple definitions of the items is provided.  This can be false
   * to indicate additional items in the array are not allowed, or it can
   * be a schema that defines the schema of the additional items.
   *
   * @see https://tools.ietf.org/html/draft-zyp-json-schema-03#section-5.6
   */
  additionalItems?: boolean | JSONSchema4 | undefined;

  /**
   * This attribute defines the allowed items in an instance array, and
   * MUST be a schema or an array of schemas.  The default value is an
   * empty schema which allows any value for items in the instance array.
   *
   * When this attribute value is a schema and the instance value is an
   * array, then all the items in the array MUST be valid according to the
   * schema.
   *
   * When this attribute value is an array of schemas and the instance
   * value is an array, each position in the instance array MUST conform
   * to the schema in the corresponding position for this array.  This
   * called tuple typing.  When tuple typing is used, additional items are
   * allowed, disallowed, or constrained by the "additionalItems"
   * (Section 5.6) attribute using the same rules as
   * "additionalProperties" (Section 5.4) for objects.
   *
   * @see https://tools.ietf.org/html/draft-zyp-json-schema-03#section-5.5
   */
  items?: JSONSchema4 | JSONSchema4[] | undefined;

  /**
   * Defines the maximum length of an array
   */
  maxItems?: number | undefined;
  /**
   * Defines the minimum length of an array
   */
  minItems?: number | undefined;
  /**
   * Enforces that all items in the array are unique
   */
  uniqueItems?: boolean | undefined;

  /**
   * The maximum number of properties allowed for record-style schemas
   */
  maxProperties?: number | undefined;
  /**
   * The minimum number of properties required for record-style schemas
   */
  minProperties?: number | undefined;

  /**
   * This attribute indicates if the instance must have a value, and not
   * be undefined. This is false by default, making the instance
   * optional.
   *
   * @see https://tools.ietf.org/html/draft-zyp-json-schema-03#section-5.7
   */
  required?: boolean | string[] | undefined;

  /**
   * This attribute defines a schema for all properties that are not
   * explicitly defined in an object type definition. If specified, the
   * value MUST be a schema or a boolean. If false is provided, no
   * additional properties are allowed beyond the properties defined in
   * the schema. The default value is an empty schema which allows any
   * value for additional properties.
   *
   * @see https://tools.ietf.org/html/draft-zyp-json-schema-03#section-5.4
   */
  additionalProperties?: boolean | JSONSchema4 | undefined;

  /**
   * Reusable definitions that can be referenced via `$ref`
   */
  definitions?:
    | {
        [k: string]: JSONSchema4;
      }
    | undefined;
  /**
   * Reusable definitions that can be referenced via `$ref`
   */
  $defs?:
    | {
        [k: string]: JSONSchema4;
      }
    | undefined;

  /**
   * This attribute is an object with property definitions that define the
   * valid values of instance object property values. When the instance
   * value is an object, the property values of the instance object MUST
   * conform to the property definitions in this object. In this object,
   * each property definition's value MUST be a schema, and the property's
   * name MUST be the name of the instance property that it defines.  The
   * instance property value MUST be valid according to the schema from
   * the property definition. Properties are considered unordered, the
   * order of the instance properties MAY be in any order.
   *
   * @see https://tools.ietf.org/html/draft-zyp-json-schema-03#section-5.2
   */
  properties?:
    | {
        [k: string]: JSONSchema4;
      }
    | undefined;

  /**
   * This attribute is an object that defines the schema for a set of
   * property names of an object instance. The name of each property of
   * this attribute's object is a regular expression pattern in the ECMA
   * 262/Perl 5 format, while the value is a schema. If the pattern
   * matches the name of a property on the instance object, the value of
   * the instance's property MUST be valid against the pattern name's
   * schema value.
   *
   * @see https://tools.ietf.org/html/draft-zyp-json-schema-03#section-5.3
   */
  patternProperties?:
    | {
        [k: string]: JSONSchema4;
      }
    | undefined;

  /**
   * The `dependencies` keyword conditionally applies a sub-schema when a given
   * property is present. This schema is applied in the same way `allOf` applies
   * schemas. Nothing is merged or extended. Both schemas apply independently.
   */
  dependencies?:
    | {
        [k: string]: JSONSchema4 | string[];
      }
    | undefined;

  /**
   * This provides an enumeration of all possible values that are valid
   * for the instance property. This MUST be an array, and each item in
   * the array represents a possible value for the instance value. If
   * this attribute is defined, the instance value MUST be one of the
   * values in the array in order for the schema to be valid.
   *
   * @see https://tools.ietf.org/html/draft-zyp-json-schema-03#section-5.19
   */
  enum?: JSONSchema4Type[] | undefined;

  /**
   * A single type, or a union of simple types
   */
  type?: JSONSchema4TypeName | JSONSchema4TypeName[] | undefined;

  /**
   * (AND) Must be valid against all of the sub-schemas
   */
  allOf?: JSONSchema4[] | undefined;
  /**
   * (OR) Must be valid against any of the sub-schemas
   */
  anyOf?: JSONSchema4[] | undefined;
  /**
   * (XOR) Must be valid against exactly one of the sub-schemas
   */
  oneOf?: JSONSchema4[] | undefined;
  /**
   * (NOT) Must not be valid against the given schema
   */
  not?: JSONSchema4 | undefined;

  /**
   * The value of this property MUST be another schema which will provide
   * a base schema which the current schema will inherit from.  The
   * inheritance rules are such that any instance that is valid according
   * to the current schema MUST be valid according to the referenced
   * schema.  This MAY also be an array, in which case, the instance MUST
   * be valid for all the schemas in the array.  A schema that extends
   * another schema MAY define additional attributes, constrain existing
   * attributes, or add other constraints.
   *
   * Conceptually, the behavior of extends can be seen as validating an
   * instance against all constraints in the extending schema as well as
   * the extended schema(s).
   *
   * @see https://tools.ietf.org/html/draft-zyp-json-schema-03#section-5.26
   */
  extends?: string | string[] | undefined;

  /**
   * The `format` keyword allows for basic semantic identification of certain
   * kinds of string values that are commonly used.
   *
   * For example, because JSON doesn’t have a “DateTime” type, dates need to be
   * encoded as strings. `format` allows the schema author to indicate that the
   * string value should be interpreted as a date.
   *
   * ajv v6 provides a few built-in formats - all other strings will cause AJV
   * to throw during schema compilation
   */
  format?:
    | 'date'
    | 'time'
    | 'date-time'
    | 'uri'
    | 'uri-reference'
    | 'uri-template'
    | 'url'
    | 'email'
    | 'hostname'
    | 'ipv4'
    | 'ipv6'
    | 'regex'
    | 'uuid'
    | 'json-pointer'
    | 'json-pointer-uri-fragment'
    | 'relative-json-pointer'
    | undefined;
}

interface JSONSchema4Base {
  id?: string | undefined;

  $schema?: JSONSchema4Version | undefined;

  /**
   * Path to a schema defined in `definitions`/`$defs` that will form the base
   * for this chema
   */
  $ref?: string | undefined;

  /**
   * This attribute is a string that provides a short description of the
   * instance property.
   *
   * @see https://tools.ietf.org/html/draft-zyp-json-schema-03#section-5.21
   */
  title?: string | undefined;

  /**
   * This attribute is a string that provides a full description of the of
   * purpose the instance property.
   *
   * @see https://tools.ietf.org/html/draft-zyp-json-schema-03#section-5.22
   */
  description?: string | undefined;

  /**
   * Reusable definitions that can be referenced via `$ref`
   */
  definitions?:
    | {
        [k: string]: JSONSchema4;
      }
    | undefined;
  /**
   * Reusable definitions that can be referenced via `$ref`
   */
  $defs?:
    | {
        [k: string]: JSONSchema4;
      }
    | undefined;

  /**
   * (AND) Must be valid against all of the sub-schemas
   */
  allOf?: JSONSchema4[] | undefined;
  /**
   * (OR) Must be valid against any of the sub-schemas
   */
  anyOf?: JSONSchema4[] | undefined;
  /**
   * (XOR) Must be valid against exactly one of the sub-schemas
   */
  oneOf?: JSONSchema4[] | undefined;
  /**
   * (NOT) Must not be valid against the given schema
   */
  not?: JSONSchema4 | undefined;

  /**
   * The value of this property MUST be another schema which will provide
   * a base schema which the current schema will inherit from.  The
   * inheritance rules are such that any instance that is valid according
   * to the current schema MUST be valid according to the referenced
   * schema.  This MAY also be an array, in which case, the instance MUST
   * be valid for all the schemas in the array.  A schema that extends
   * another schema MAY define additional attributes, constrain existing
   * attributes, or add other constraints.
   *
   * Conceptually, the behavior of extends can be seen as validating an
   * instance against all constraints in the extending schema as well as
   * the extended schema(s).
   *
   * @see https://tools.ietf.org/html/draft-zyp-json-schema-03#section-5.26
   */
  extends?: string | string[] | undefined;
}

/**
 * @see https://json-schema.org/understanding-json-schema/reference/object.html
 */
export interface JSONSchema4ObjectSchema extends JSONSchema4Base {
  type: 'object';

  /**
   * This attribute defines a schema for all properties that are not
   * explicitly defined in an object type definition. If specified, the
   * value MUST be a schema or a boolean. If false is provided, no
   * additional properties are allowed beyond the properties defined in
   * the schema. The default value is an empty schema which allows any
   * value for additional properties.
   *
   * @see https://tools.ietf.org/html/draft-zyp-json-schema-03#section-5.4
   */
  additionalProperties?: boolean | JSONSchema4 | undefined;

  /**
   * This attribute is an object with property definitions that define the
   * valid values of instance object property values. When the instance
   * value is an object, the property values of the instance object MUST
   * conform to the property definitions in this object. In this object,
   * each property definition's value MUST be a schema, and the property's
   * name MUST be the name of the instance property that it defines.  The
   * instance property value MUST be valid according to the schema from
   * the property definition. Properties are considered unordered, the
   * order of the instance properties MAY be in any order.
   *
   * @see https://tools.ietf.org/html/draft-zyp-json-schema-03#section-5.2
   */
  properties?:
    | {
        [k: string]: JSONSchema4;
      }
    | undefined;

  /**
   * This attribute is an object that defines the schema for a set of
   * property names of an object instance. The name of each property of
   * this attribute's object is a regular expression pattern in the ECMA
   * 262/Perl 5 format, while the value is a schema. If the pattern
   * matches the name of a property on the instance object, the value of
   * the instance's property MUST be valid against the pattern name's
   * schema value.
   *
   * @see https://tools.ietf.org/html/draft-zyp-json-schema-03#section-5.3
   */
  patternProperties?:
    | {
        [k: string]: JSONSchema4;
      }
    | undefined;

  /**
   * The `dependencies` keyword conditionally applies a sub-schema when a given
   * property is present. This schema is applied in the same way `allOf` applies
   * schemas. Nothing is merged or extended. Both schemas apply independently.
   */
  dependencies?:
    | {
        [k: string]: JSONSchema4 | string[];
      }
    | undefined;

  /**
   * The maximum number of properties allowed for record-style schemas
   */
  maxProperties?: number | undefined;
  /**
   * The minimum number of properties required for record-style schemas
   */
  minProperties?: number | undefined;
}

/**
 * @see https://json-schema.org/understanding-json-schema/reference/array.html
 */
export interface JSONSchema4ArraySchema extends JSONSchema4Base {
  type: 'array';

  /**
   * May only be defined when "items" is defined, and is a tuple of JSONSchemas.
   *
   * This provides a definition for additional items in an array instance
   * when tuple definitions of the items is provided.  This can be false
   * to indicate additional items in the array are not allowed, or it can
   * be a schema that defines the schema of the additional items.
   *
   * @see https://tools.ietf.org/html/draft-zyp-json-schema-03#section-5.6
   */
  additionalItems?: boolean | JSONSchema4 | undefined;

  /**
   * This attribute defines the allowed items in an instance array, and
   * MUST be a schema or an array of schemas.  The default value is an
   * empty schema which allows any value for items in the instance array.
   *
   * When this attribute value is a schema and the instance value is an
   * array, then all the items in the array MUST be valid according to the
   * schema.
   *
   * When this attribute value is an array of schemas and the instance
   * value is an array, each position in the instance array MUST conform
   * to the schema in the corresponding position for this array.  This
   * called tuple typing.  When tuple typing is used, additional items are
   * allowed, disallowed, or constrained by the "additionalItems"
   * (Section 5.6) attribute using the same rules as
   * "additionalProperties" (Section 5.4) for objects.
   *
   * @see https://tools.ietf.org/html/draft-zyp-json-schema-03#section-5.5
   */
  items?: JSONSchema4 | JSONSchema4[] | undefined;

  /**
   * Defines the maximum length of an array
   */
  maxItems?: number | undefined;

  /**
   * Defines the minimum length of an array
   */
  minItems?: number | undefined;

  /**
   * Enforces that all items in the array are unique
   */
  uniqueItems?: boolean | undefined;
}

interface JSONSchema4PrimitiveBase extends JSONSchema4Base {
  /**
   * This provides an enumeration of all possible values that are valid
   * for the instance property. This MUST be an array, and each item in
   * the array represents a possible value for the instance value. If
   * this attribute is defined, the instance value MUST be one of the
   * values in the array in order for the schema to be valid.
   *
   * @see https://tools.ietf.org/html/draft-zyp-json-schema-03#section-5.19
   */
  enum?: JSONSchema4Type[] | undefined;
}

/**
 * @see https://json-schema.org/understanding-json-schema/reference/string.html
 */
export interface JSONSchema4StringSchema extends JSONSchema4PrimitiveBase {
  type: 'string';

  /**
   * The `pattern` keyword is used to restrict a string to a particular regular
   * expression. The regular expression syntax is the one defined in JavaScript
   * (ECMA 262 specifically) with Unicode support.
   *
   * When defining the regular expressions, it’s important to note that the
   * string is considered valid if the expression matches anywhere within the
   * string. For example, the regular expression "p" will match any string with
   * a p in it, such as "apple" not just a string that is simply "p". Therefore,
   * it is usually less confusing, as a matter of course, to surround the
   * regular expression in ^...$, for example, "^p$", unless there is a good
   * reason not to do so.
   */
  pattern?: string | undefined;

  /**
   * The `format` keyword allows for basic semantic identification of certain
   * kinds of string values that are commonly used.
   *
   * For example, because JSON doesn’t have a “DateTime” type, dates need to be
   * encoded as strings. `format` allows the schema author to indicate that the
   * string value should be interpreted as a date.
   *
   * ajv v6 provides a few built-in formats - all other strings will cause AJV
   * to throw during schema compilation
   */
  format?:
    | 'date'
    | 'time'
    | 'date-time'
    | 'uri'
    | 'uri-reference'
    | 'uri-template'
    | 'url'
    | 'email'
    | 'hostname'
    | 'ipv4'
    | 'ipv6'
    | 'regex'
    | 'uuid'
    | 'json-pointer'
    | 'json-pointer-uri-fragment'
    | 'relative-json-pointer'
    | undefined;
}

/**
 * @see https://json-schema.org/understanding-json-schema/reference/numeric.html
 */
export interface JSONSchema4NumberSchema extends JSONSchema4PrimitiveBase {
  type: 'number' | 'integer';
}
