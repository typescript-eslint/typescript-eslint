import fs from 'fs';
import marked from 'marked';
import path from 'path';

function parseReadme(): marked.Tokens.Table {
  const readmeRaw = fs.readFileSync(
    path.resolve(__dirname, '../../README.md'),
    'utf8',
  );
  const readme = marked.lexer(readmeRaw, {
    gfm: true,
    tables: true,
    silent: false,
  });

  // find the table
  const rulesTable = readme.find(
    token => token.type === 'table',
  ) as marked.Tokens.Table;
  if (!rulesTable) {
    console.error('Could not find the rules table in README.md');
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }

  return rulesTable;
}

export { parseReadme };
