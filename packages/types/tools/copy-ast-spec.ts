import chlidProcess from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const execAsync = promisify(chlidProcess.exec);

const AST_SPEC_PATH = path.resolve(__dirname, '../../ast-spec');
const OUTPUT_PATH = path.join(path.resolve(__dirname, '../src/'));

// ensure the package is built
chlidProcess.execSync('yarn build', { cwd: AST_SPEC_PATH });

const HEADER = `\
/**********************************************
 *      DO NOT MODIFY THIS FILE MANUALLY      *
 *                                            *
 *  THIS FILE HAS BEEN COPIED FROM ast-spec.  *
 * ANY CHANGES WILL BE LOST ON THE NEXT BUILD *
 *                                            *
 *   MAKE CHANGES TO ast-spec AND THEN RUN    *
 *                 yarn build                 *
 **********************************************/

`;

async function copyFile(
  folderName: string,
  fileName: string,
  transformer: (code: string) => string = (s): string => s,
): Promise<void> {
  const code = await readFile(
    path.join(AST_SPEC_PATH, folderName, fileName),
    'utf-8',
  );

  const transformedCode = transformer(code);

  const outpath = path.join(OUTPUT_PATH, fileName);
  await writeFile(outpath, HEADER + transformedCode, {
    encoding: 'utf-8',
  });

  await execAsync(`yarn prettier --write ${outpath}`);

  console.log('Copied', fileName);
}

async function main(): Promise<void> {
  await Promise.all([
    copyFile('dist', 'ast-spec.ts', code =>
      code.replace(/export declare enum/g, 'export enum'),
    ),
  ]);
}

void main();
