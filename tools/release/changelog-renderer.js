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
    const version = this.changelogEntryVersion;
    const githubLink = version
      ? `See [GitHub Releases](https://github.com/typescript-eslint/typescript-eslint/releases/tag/v${version}) for more information.`
      : `See [GitHub Releases](https://github.com/typescript-eslint/typescript-eslint/releases) for more information.`;
    // Append custom messaging to the generated changelog entry
    return (
      `${defaultChangelog}\n\n` +
      `${githubLink}\n\n` +
      `You can read about our [versioning strategy](https://typescript-eslint.io/users/versioning) and [releases](https://typescript-eslint.io/users/releases) on our website.`
    );
  }
};
