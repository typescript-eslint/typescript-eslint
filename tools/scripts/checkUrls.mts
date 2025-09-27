import { JSDOM } from 'jsdom';
import { createSpinner } from 'nanospinner';
import { existsSync } from 'node:fs';
import { readFile, appendFile, writeFile } from 'node:fs/promises';

// command used to generate matches.txt:
// we're not running them ourselves because windows doesn't come with grep unfortunately :/
const command = String.raw`grep -E "https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)" -I -o -r . --exclude-dir={node_modules,.nx} --exclude={graveyard.txt,matches.txt,matches-only.txt} > matches.txt`;
// regex stolen from: https://stackoverflow.com/a/3809435

if (!existsSync('matches.txt')) {
  console.error(
    `Looks like matches.txt doesn't exist. Run these two commands first (if you're running windows run them in git bash):\n${command}`,
  );
  // I want to output a clear error message instead of a long stack trace
  // eslint-disable-next-line no-process-exit
  process.exit(1);
}

function createFakeSpinner(log: string) {
  console.log(log);
  return {
    start() {
      return this;
    },
    success: console.log.bind(console, '[Success]'),
    update: console.log.bind(console, '[Update]'),
  };
}

const createSpinnerFunction = process.argv.includes('--spinner')
  ? createSpinner
  : createFakeSpinner;
const spinner = createSpinnerFunction('Initializing - Reading Files').start();

const matches = await readFile('matches.txt', { encoding: 'utf8' });
const matchesLines = matches.split('\n');

console.log('[Graveyard.js] got like', matchesLines.length, 'matches 💀');
await writeFile('graveyard.txt', '');

// check if there's a hash eg #how-to-do-this?x=3
function getHash(url: string): string | undefined {
  const hashString = new URL(url).hash.trim();
  if (!hashString) {
    return;
  }
  if (!hashString.startsWith('#')) {
    return;
  }

  // get the part between # and ?, including the #
  const questionMarkIndex = hashString.indexOf('?');
  if (questionMarkIndex === -1) {
    return hashString;
  }
  return hashString.slice(0, questionMarkIndex);
}

function getErrorInfo(error: unknown): string {
  if (typeof error !== 'object') {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return String(error);
  }
  if (error == null) {
    return 'null';
  }
  const errorInfo = [];

  //@ts-expect-error well yeah I know so that's why I'm checking
  const { syscall } = error;
  if (syscall) {
    errorInfo.push(syscall);
  }

  //@ts-expect-error well yeah I know so that's why I'm checking
  const { code } = error;
  if (code) {
    errorInfo.push(code);
  }

  return `: ${errorInfo.join(': ')}`;
}

for (let i = 0; i < matchesLines.length; i++) {
  const iterationInfo = `Cooking (${i + 1}/${matchesLines.length}) 🔥`;
  const update = (info: string) =>
    spinner.update(`${iterationInfo} ${info}`.trim());
  update('');

  const match = matchesLines[i];
  if (match.startsWith('Binary file')) {
    continue;
  }

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
      `[Fetch error: ${getErrorInfo(error)}] ${match}\n`,
    );
    continue;
  }

  if (!result.ok) {
    await appendFile(
      'graveyard.txt',
      `[HTTP ${result.status} ${result.statusText}] ${match}\n`,
    );
    continue;
  }

  // if there's no #how-to-do-this-part hash in the url, there's nothing more to check
  const hash = getHash(result.url);
  if (!hash) {
    continue;
  }

  // check if the content type is html before checking it
  const contentType = result.headers.get('content-type')?.split(';');
  if (!contentType?.[0].includes('html')) {
    if (hash) {
      await appendFile(
        'graveyard.txt',
        `[Non-HTML contentType header but a hash is present ${hash}] ${match}\n`,
      );
    }
    continue;
  }

  update('Fetching Text');
  const html = await result.text();
  update('Processing through JSDOM');
  const jsdom = new JSDOM(html, { url });
  const linkedElement = jsdom.window.document.querySelector(hash);
  if (!linkedElement) {
    await appendFile('graveyard.txt', `[Missing element ${hash}] ${match}\n`);
  }
}

spinner.success('Successful! Check graveyard.txt');
