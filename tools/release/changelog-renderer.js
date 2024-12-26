/* eslint-disable @typescript-eslint/no-require-imports */

// @ts-check
const {
  default: DefaultChangelogRenderer,
} = require('nx/release/changelog-renderer');

module.exports = class CustomChangelogRenderer extends (
  DefaultChangelogRenderer
) {
  async render() {
    const defaultChangelog = await super.render();
    // Append our custom messaging to the generated changelog entry
    return `${defaultChangelog}\n\nYou can read about our [versioning strategy](https://main--typescript-eslint.netlify.app/users/versioning) and [releases](https://main--typescript-eslint.netlify.app/users/releases) on our website.`;
  }
};
