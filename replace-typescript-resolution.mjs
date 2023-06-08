import fs from 'node:fs/promises';

const existing = JSON.parse((await fs.readFile('./package.json')).toString());

existing.resolutions.typescript = process.argv[2];

await fs.writeFile('./package.json', JSON.stringify(existing, null, 2));
