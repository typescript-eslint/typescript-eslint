/** @import { dependency } from './dependency' */
/** @typedef {string} Name */

/** @type {Name} */
const name = 'native';

/**
 * @param {number} value
 * @returns {Name}
 */
function describe(value) {
  return `${name}: ${value}`;
}

class Box {
  /** @type {number} */
  size = 1;
}

export { Box, describe };
