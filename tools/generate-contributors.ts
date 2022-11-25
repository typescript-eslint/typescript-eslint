// this script uses the github api to fetch a list of contributors
// https://developer.github.com/v3/repos/#list-contributors
// this endpoint returns a list of contributors sorted by number of contributions

import fetch from 'cross-fetch';
import * as fs from 'fs';
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
  type: string;
  login?: string;
  url?: string;
  avatar_url?: string;
  html_url?: string;
}
interface User {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
}

async function getData<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.github.v3+json',
      // Authorization: 'token ghp_*', // if needed, replace this with your token
    },
  });

  return (await response.json()) as Promise<T>;
}

async function* fetchUsers(page = 1): AsyncIterableIterator<Contributor[]> {
  let lastLength = 0;
  do {
    const contributors = await getData<Contributor[] | { message: string }>(
      `${contributorsApiUrl}&page=${page}`,
    );

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

function writeTable(contributors: User[], perLine = 5): void {
  const columns = contributors.length > perLine ? perLine : contributors.length;

  const lines = [
    '# Contributors',
    '',
    'Thanks goes to these wonderful people:',
    '',
    '<!-- prettier-ignore-start -->',
    '<!-- markdownlint-disable -->',
    '<table>',
  ];

  let i = 0;
  for (const usr of contributors) {
    if (i % columns === 0) {
      if (i !== 0) {
        lines.push('  </tr>');
      }
      lines.push('  <tr>');
    }

    const image = `<img src="${usr.avatar_url}&size=100" width="100px;" alt=""/>`;
    const name = `<sub><b>${usr.name || usr.login}</b></sub>`;

    lines.push(
      `    <td align="center"><a href="${usr.html_url}">${image}<br />${name}</a></td>`,
    );
    ++i;
  }
  if (i % columns !== 0) {
    lines.push('  </tr>');
  }

  lines.push('</table>');
  lines.push('');
  lines.push('<!-- markdownlint-restore -->');
  lines.push('<!-- prettier-ignore-end -->');
  lines.push('');
  lines.push(
    `<sup>This list is auto-generated using \`yarn generate-contributors\`. It shows the top ${PAGE_LIMIT} contributors with > ${COMPLETELY_ARBITRARY_CONTRIBUTION_COUNT} contributions.</sup>`,
  );
  lines.push('');

  fs.writeFileSync(
    path.join(__dirname, '../CONTRIBUTORS.md'),
    lines.join('\n'),
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
    githubContributors
      // remove ignored users and bots
      .filter(
        usr => usr.login && usr.type !== 'Bot' && !IGNORED_USERS.has(usr.login),
      )
      // fetch the in-depth information for each user
      .map(c => getData<User>(c.url)),
  );

  writeTable(
    users.filter(c => c.login),
    5,
  );
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
