const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, 'packages/typescript-estree/tests/lib');

function walk(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath, filelist);
    } else if (file.endsWith('.ts')) {
      filelist.push(fullPath);
    }
  });
  return filelist;
}

const files = walk(testDir);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  let updated = content;

  // Add import path if not present
  if (!updated.includes("path from 'path'")) {
    updated = updated.replace(/^(import.*\n)/, `$1import path from 'path';\n`);
  }

  // Replace tsconfigRootDir: './something' with path.resolve(__dirname, '...')
  updated = updated.replace(
    /tsconfigRootDir:\s*['"`]([^'"`]+)['"`]/g,
    (_, relPath) => `tsconfigRootDir: path.resolve(__dirname, '${relPath}')`,
  );

  // Replace project: './something'
  updated = updated.replace(
    /project:\s*['"`]([^'"`]+)['"`]/g,
    (_, relPath) => `project: path.resolve(__dirname, '${relPath}')`,
  );

  // Replace filePath: './something'
  updated = updated.replace(
    /filePath:\s*['"`]([^'"`]+)['"`]/g,
    (_, relPath) => `filePath: path.resolve(__dirname, '${relPath}')`,
  );

  if (content !== updated) {
    fs.writeFileSync(file, updated, 'utf-8');
    console.log(`✔ Updated: ${file}`);
  }
}
