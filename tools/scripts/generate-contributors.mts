// this script uses the github api to fetch a list of contributors
// https://developer.github.com/v3/repos/#list-contributors
// this endpoint returns a list of contributors sorted by number of contributions

import fetch from 'cross-fetch';
import fs from 'node:fs';
import path from 'node:path';

import { REPO_ROOT } from './paths.mts';

const IGNORED_USERS = new Set([
  'dependabot[bot]',
  'eslint[bot]',
  'greenkeeper[bot]',
  'semantic-release-bot',
]);

const COMPLETELY_ARBITRARY_CONTRIBUTION_COUNT = 3;
const PAGE_LIMIT = 100;
// arbitrary limit -- this means we can only fetch 10*100=1000 contributors but it means we don't ever loop forever
const MATCH_PAGE_NUMBER = 10;
const contributorsApiUrl = `https://api.github.com/repos/typescript-eslint/typescript-eslint/contributors?per_page=${PAGE_LIMIT}`;

interface Contributor {
  avatar_url?: string;
  contributions: number;
  html_url?: string;
  login?: string;
  type: string;
  url?: string;
}
interface User {
  avatar_url: string;
  html_url: string;
  login: string;
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- intentional 'unsafe' single generic in return type
async function getData<T>(
  url: string,
): Promise<{ body: T; linkHeader: string | null }>;
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- intentional 'unsafe' single generic in return type
async function getData<T>(
  url: string | undefined,
): Promise<{ body: T; linkHeader: string | null } | null>;
async function getData<T>(
  url: string | undefined,
): Promise<{ body: T; linkHeader: string | null } | null> {
  if (url == null) {
    return null;
  }

  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      // Authorization: 'token ghp_xxxx', // if needed, replace this with your token
    },
    method: 'GET',
  });

  const linkHeader = response.headers.get('link');

  return {
    body: (await response.json()) as T,
    linkHeader,
  };
}

async function* fetchUsers(page = 1): AsyncIterableIterator<Contributor[]> {
  while (page <= MATCH_PAGE_NUMBER) {
    console.log(`Fetching page ${page} of contributors...`);
    const contributors = await getData<Contributor[] | { message: string }>(
      `${contributorsApiUrl}&page=${page}`,
    );

    if (!Array.isArray(contributors.body)) {
      throw new Error(contributors.body.message);
    }

    const thresholdedContributors = contributors.body.filter(
      user => user.contributions >= COMPLETELY_ARBITRARY_CONTRIBUTION_COUNT,
    );
    yield thresholdedContributors;

    if (
      // https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api?apiVersion=2022-11-28#using-link-headers
      // > The URL for the next page is followed by rel="next".
      // > the link to the last page won't be included if it can't be calculated.
      // i.e. if there's no "next" link then there's no next page and we're at the end
      !contributors.linkHeader?.includes('rel="next"')
    ) {
      break;
    }

    page += 1;
  }
}

function writeTable(contributors: User[], perLine = 5): void {
  const columns = contributors.length > perLine ? perLine : contributors.length;

  const lines = [
    '<!-- ------------------------------------------',
    ' |      DO NOT MODIFY THIS FILE MANUALLY      |',
    ' |                                            |',
    ' | THIS FILE HAS BEEN AUTOMATICALLY GENERATED |',
    ' |                                            |',
    ' |     YOU CAN REGENERATE THIS FILE USING     |',
    ' |         pnpm run generate-contributors     |',
    ' ------------------------------------------- -->',
    '',
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

  lines.push('  </tr>');
  lines.push('</table>');
  lines.push('');
  lines.push('<!-- markdownlint-restore -->');
  lines.push('<!-- prettier-ignore-end -->');
  lines.push('');
  lines.push(
    `<sup>This list is auto-generated using \`pnpm run generate-contributors\`. It shows the top ${PAGE_LIMIT} contributors with > ${COMPLETELY_ARBITRARY_CONTRIBUTION_COUNT} contributions.</sup>`,
  );
  lines.push('');

  fs.writeFileSync(path.join(REPO_ROOT, 'CONTRIBUTORS.md'), lines.join('\n'));
}

const githubContributors: Contributor[] = [];

// fetch all of the contributor info
for await (const lastUsers of fetchUsers()) {
  githubContributors.push(...lastUsers);
}

// fetch the user info
console.log(`Fetching user information...`);
const users = await Promise.allSettled(
  githubContributors
    // remove ignored users and bots
    .filter(
      usr => usr.login && usr.type !== 'Bot' && !IGNORED_USERS.has(usr.login),
    )
    // fetch the in-depth information for each user
    .map(c => getData<User>(c.url)),
);

writeTable(
  users
    .map(result => {
      if (result.status === 'fulfilled') {
        return result.value?.body;
      }
      return null;
    })
    .filter((c): c is User => c?.login != null),
  5,
);
