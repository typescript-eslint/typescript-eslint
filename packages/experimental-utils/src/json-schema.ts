// Note - @types/json-schema@7.0.4 added some function declarations to the type package
// If we do export *, then it will also export these function declarations.
// This will cause typescript to not scrub the require from the build, breaking anyone who doesn't have it as a dependency

export {
  JSONSchema4,
  JSONSchema4Type,
  JSONSchema4TypeName,
  JSONSchema4Version,
  JSONSchema6,
  JSONSchema6Definition,
  JSONSchema6Type,
  JSONSchema6TypeName,
  JSONSchema6Version,
  JSONSchema7,
  JSONSchema7Array,
  JSONSchema7Definition,
  JSONSchema7Type,
  JSONSchema7TypeName,
  JSONSchema7Version,
  ValidationError,
  ValidationResult,
} from 'json-schema'; // eslint-disable-line import/no-extraneous-dependencies
