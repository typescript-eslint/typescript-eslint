// @ts-check
/* eslint-disable jsdoc/no-types, @typescript-eslint/no-require-imports */

const core = require('@actions/core');
const github = require('@actions/github');

async function getPullRequest() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      'The GITHUB_TOKEN environment variable is required to run this action.',
    );
  }
  const client = github.getOctokit(token);

  const pr = github.context.payload.pull_request;
  if (!pr) {
    throw new Error(
      "This action can only be invoked in `pull_request_target` or `pull_request` events. Otherwise the pull request can't be inferred.",
    );
  }

  const owner = pr.base.user.login;
  const repo = pr.base.repo.name;

  const { data } = await client.rest.pulls.get({
    owner,
    pull_number: pr.number,
    repo,
  });

  return data;
}

/**
 * @param {string} title The PR title to check
 */
function checkTitle(title) {
  if (/^[a-z]+(\([a-z-]+\))?!: /.test(title)) {
    throw new Error(
      `Do not use exclamation mark ('!') to indicate breaking change in the PR Title.`,
    );
  }
}

/**
 * @param {string} body The body of the PR
 * @param {any[]} labels The labels applied to the PR
 */
function checkDescription(body, labels) {
  if (!labels.some(label => label.name === 'breaking change')) {
    return;
  }
  const [firstLine, secondLine] = body.split(/\r?\n/);

  if (!firstLine || !/^BREAKING CHANGE:/.test(firstLine)) {
    throw new Error(
      `Breaking change PR body should start with "BREAKING CHANGE:". See https://typescript-eslint.io/maintenance/releases#2-merging-breaking-changes.`,
    );
  }
  if (!secondLine) {
    throw new Error(
      `The description of breaking change is missing. See https://typescript-eslint.io/maintenance/releases#2-merging-breaking-changes.`,
    );
  }
}

async function run() {
  const pullRequest = await getPullRequest();
  try {
    checkTitle(pullRequest.title);
    checkDescription(pullRequest.body ?? '', pullRequest.labels);
  } catch (/** @type {any} */ e) {
    core.setFailed(e.message);
  }
}

run();
