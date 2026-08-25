/* eslint-disable @typescript-eslint/no-require-imports */

// @ts-check
const {
  default: DefaultChangelogRenderer,
} = require('nx/release/changelog-renderer');

const EXCLUDED_AUTHORS = ['Claude', 'Cursor', 'Amp'].map(
  name => new RegExp(`^${name}\\b`),
);

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

  async renderAuthors() {
    const defaultAuthors = await super.renderAuthors();

    const filteredAuthors = defaultAuthors.filter(author => {
      // Authors are returned with a leading dash (i.e. `- User Name @handle`).
      const normalizedAuthor = author.replace(/^-/, '').trim();

      return !EXCLUDED_AUTHORS.some(pattern => pattern.test(normalizedAuthor));
    });

    return filteredAuthors;
  }
};
