/// <reference types="cypress" />

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = on => {
  on('task', {
    log(message) {
      console.log(message);
      return null;
    },
    table(message) {
      console.table(message);
      return null;
    },
  });
};
