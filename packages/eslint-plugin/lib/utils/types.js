'use strict';

const tsutils = require('tsutils');
const ts = require('typescript');

/**
 * @param {string} type Type being checked by name.
 * @param {Set<string>} allowedNames Symbol names checking on the type.
 * @returns {boolean} Whether the type is, extends, or contains any of the allowed names.
 */
function containsTypeByName(type, allowedNames) {
  if (tsutils.isTypeFlagSet(type, ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
    return true;
  }

  if (tsutils.isTypeReference(type)) {
    type = type.target;
  }

  if (
    typeof type.symbol !== 'undefined' &&
    allowedNames.has(type.symbol.name)
  ) {
    return true;
  }

  if (tsutils.isUnionOrIntersectionType(type)) {
    return type.types.some(t => containsTypeByName(t, allowedNames));
  }

  const bases = type.getBaseTypes();
  return (
    typeof bases !== 'undefined' &&
    bases.some(t => containsTypeByName(t, allowedNames))
  );
}

exports.containsTypeByName = containsTypeByName;
