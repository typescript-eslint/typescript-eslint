// this script uses the github api to fetch a list of contributors
// https://developer.github.com/v3/repos/#list-contributors
// this endpoint returns a list of contributors sorted by number of contributions

import * as fs from 'fs';
import 'isomorphic-fetch';
import * as path from 'path';

const IGNORED_USERS = new Set([
  'dependabot[bot]',
  'eslint[bot]',
  'greenkeeper[bot]',
  'semantic-release-bot',
]);

const COMPLETELY_ARBITRARY_CONTRIBUTION_COUNT = 3;
const PAGE_LIMIT = 100;
const contributorsApiUrl = `https://api.github.com/repos/typescript-eslint/typescript-eslint/contributors?per_page=${PAGE_LIMIT}`;

interface Contributor {
  contributions: number;
  login: string;
  url: string;
}
interface User {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
}
interface AllContributorsUser {
  login: string;
  name: string;
  avatar_url: string;
  profile: string;
  contributions: string[];
}

async function* fetchUsers(page = 1): AsyncIterableIterator<Contributor[]> {
  let lastLength = 0;
  do {
    const response = await fetch(`${contributorsApiUrl}&page=${page}`, {
      method: 'GET',
    });
    const contributors:
      | Contributor[]
      | { message: string } = await response.json();

    if (!Array.isArray(contributors)) {
      throw new Error(contributors.message);
    }

    const thresholdedContributors = contributors.filter(
      user => user.contributions >= COMPLETELY_ARBITRARY_CONTRIBUTION_COUNT,
    );
    yield thresholdedContributors;

    lastLength = thresholdedContributors.length;
  } while (
    /*
      If the filtered list wasn't 100 long, that means that either:
      - there wasn't 100 users in the page, or
      - there wasn't 100 users with > threshold commits in the page.

      In either case, it means that there's no need to fetch any more pages
    */
    lastLength === PAGE_LIMIT
  );
}

async function main(): Promise<void> {
  const githubContributors: Contributor[] = [];

  // fetch all of the contributor info
  for await (const lastUsers of fetchUsers()) {
    githubContributors.push(...lastUsers);
  }

  // fetch the user info
  const users = await Promise.all(
    githubContributors.map<Promise<User>>(async c => {
      const response = await fetch(c.url, { method: 'GET' });
      return response.json();
    }),
  );

  const contributors = users
    // remove ignored users
    .filter(u => !IGNORED_USERS.has(u.login))
    // fetch the in-depth information for each user
    .map<AllContributorsUser>(usr => {
      return {
        login: usr.login,
        name: usr.name || usr.login,
        avatar_url: usr.avatar_url,
        profile: usr.html_url,
        contributions: [],
      };
    });

  // build + write the .all-contributorsrc
  const allContributorsConfig = {
    projectName: 'typescript-eslint',
    projectOwner: 'typescript-eslint',
    repoType: 'github',
    repoHost: 'https://github.com',
    files: ['CONTRIBUTORS.md'],
    imageSize: 100,
    commit: false,
    contributors,
    contributorsPerLine: 5,
  };
  const rcPath = path.resolve(__dirname, '../.all-contributorsrc');
  fs.writeFileSync(rcPath, JSON.stringify(allContributorsConfig, null, 2));
}

main();
