import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// the promisify util will eat the stderr logs
async function execAsync(
  command: string,
  args: ReadonlyArray<string>,
  options: childProcess.SpawnOptions,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = childProcess.spawn(command, args, {
      ...options,
      stdio: 'inherit',
    });

    child.on('error', e => reject(e));
    child.on('exit', () => resolve());
    child.on('close', () => resolve());
  });
}

const AST_SPEC_PATH = path.resolve(__dirname, '../../ast-spec');
const OUTPUT_PATH = path.join(path.resolve(__dirname, '../src/generated'));
if (!fs.existsSync(OUTPUT_PATH)) {
  fs.mkdirSync(OUTPUT_PATH);
}

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

  await execAsync('yarn', ['prettier', '--write', outpath], {});

  console.log('Copied', fileName);
}

async function main(): Promise<void> {
  // ensure the package is built
  await execAsync('yarn', ['build'], { cwd: AST_SPEC_PATH });

  await Promise.all([
    copyFile('dist', 'ast-spec.ts', code =>
      code.replace(/export declare enum/g, 'export enum'),
    ),
  ]);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
