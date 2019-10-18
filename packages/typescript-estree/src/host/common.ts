import path from 'path';
import ts from 'typescript';

const getCanonicalFileName = ts.sys.useCaseSensitiveFileNames
  ? (path: string): string => path
  : (path: string): string => path.toLowerCase();

const noop = (): void => {};

type TSConfigPath = string;
type NormalisedTSConfigPath = string & { __pathBrand: never };
function normaliseTSConfigPath(
  tsconfigPath: TSConfigPath,
): NormalisedTSConfigPath {
  return path.normalize(tsconfigPath) as NormalisedTSConfigPath;
}

function normaliseFilePath(
  fileName: string,
  tsconfigPath: NormalisedTSConfigPath,
): ts.Path {
  return toPath(fileName, path.dirname(tsconfigPath));
}

function toPath(fileName: string, basePath: string | undefined): ts.Path {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore - internal typescript API - https://github.com/microsoft/TypeScript/blob/dd58bfc51417d0a037ea75fe8e8cd690ee9950eb/src/compiler/path.ts#L554-L559
  return ts.toPath(fileName, basePath, getCanonicalFileName);
}

export {
  getCanonicalFileName,
  noop,
  toPath,
  normaliseFilePath,
  NormalisedTSConfigPath,
  normaliseTSConfigPath,
  TSConfigPath,
};
