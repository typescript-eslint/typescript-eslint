import { readFile, appendFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { createSpinner } from 'nanospinner';

// commands used:
// we're not running them ourselves because windows doesn't come with grep unfortunately :/
const commandMatches =
  'grep -E "https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)" -r . --exclude-dir=node_modules > matches.txt';
const commandMatchesOnly =
  'grep -E "https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)" -o -r . --exclude-dir=node_modules > matches-only.txt';
// regex stolen from: https://stackoverflow.com/a/3809435

if (!existsSync('matches-only.txt') || !existsSync('matches.txt')) {
  console.error(
    `Looks like matches.txt or matches-only.txt doesn't exist. Run these two commands first (if you're running windows run them in git bash):\n${commandMatches}\n${commandMatchesOnly}`,
  );
  process.exit(1);
}

const spinner = createSpinner('Initializing - Reading Files').start();

const matches = await readFile('matches-only.txt', { encoding: 'utf8' });
const matchesLines = matches.split('\n');
const matchesInfo = await readFile('matches.txt', { encoding: 'utf8' });
const matchesInfoLines = matchesInfo.split('\n');

console.log('[Graveyard.js] got like', matchesLines.length, 'matches 💀');
await writeFile('graveyard.txt', '');

// check if there's a hash eg #how-to-do-this?x=3
function getHash(url: string): string | undefined {
  const hashString = new URL(url).hash.trim();
  if (!hashString) return;
  if (!hashString.startsWith('#')) return;

  // get the part between # and ?, including the #
  const questionMarkIndex = hashString.indexOf('?');
  if (questionMarkIndex === -1) return hashString;
  return hashString.slice(0, questionMarkIndex);
}

for (let i = 0; i < matchesLines.length; i++) {
  const iterationInfo = `Cooking (${i + 1}/${matchesLines.length}) 🔥`;
  const update = (info: string) =>
    spinner.update(`${iterationInfo} ${info}`.trim());
  update('');

  const match = matchesLines[i];
  if (match.startsWith('Binary file')) continue;

  const info = matchesInfoLines[i];
  const [, ...urlParts] = match.split(':');
  const url = urlParts.join(':');
  update(`Fetching - ${url}`);

  // check if the url is still alive
  let result;
  try {
    result = await fetch(url);
  } catch (error) {
    await appendFile(
      'graveyard.txt',
      `[Fetch error: ${error?.syscall}: ${error?.code}] ${info}\n`,
    );
    continue;
  }

  if (!result.ok) {
    await appendFile(
      'graveyard.txt',
      `[HTTP ${result.status} ${result.statusText}] ${info}\n`,
    );
    continue;
  }

  // if there's no #how-to-do-this-part hash in the url, there's nothing more to check
  const hash = getHash(result.url);
  if (!hash) continue;

  // check if the content type is html before checking it
  const contentType = result.headers.get('content-type')?.split(';');
  if (!contentType || !contentType[0].includes('html')) {
    if (hash)
      await appendFile(
        'graveyard.txt',
        `[Non-HTML contentType header but a hash is present ${hash}] ${info}\n`,
      );
    continue;
  }

  update('Fetching Text');
  const html = await result.text();
  update('Processing through JSDOM');
  const jsdom = new JSDOM(html, { url });
  const linkedElement = jsdom.window.document.querySelector(hash);
  if (!linkedElement)
    await appendFile('graveyard.txt', `[Missing element ${hash}] ${info}\n`);
}

spinner.success('Successful! Check graveyard.txt');
