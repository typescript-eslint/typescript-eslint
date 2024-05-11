// @ts-check
const {
  default: defaultChangelogRenderer,
} = require('nx/release/changelog-renderer');

const changelogRenderer = async ({
  projectGraph,
  commits,
  releaseVersion,
  project,
  entryWhenNoChanges,
  changelogRenderOptions,
  repoSlug,
  conventionalCommitsConfig,
}) => {
  const defaultChangelog = await defaultChangelogRenderer({
    projectGraph,
    commits,
    releaseVersion,
    project,
    entryWhenNoChanges,
    changelogRenderOptions,
    repoSlug,
    conventionalCommitsConfig,
  });

  // Append our custom messaging to the generated changelog entry
  return `${defaultChangelog}\n\nYou can read about our [versioning strategy](https://main--typescript-eslint.netlify.app/users/versioning) and [releases](https://main--typescript-eslint.netlify.app/users/releases) on our website.`;
};

module.exports = changelogRenderer;
