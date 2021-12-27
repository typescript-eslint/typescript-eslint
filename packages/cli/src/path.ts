import path from 'path';

type AbsolutePath = string & { __AbsolutePathBrand: unknown };
function getAbsolutePath(
  p: string,
  base: string = process.cwd(),
): AbsolutePath {
  if (path.isAbsolute(p)) {
    return p as AbsolutePath;
  }
  return path.resolve(base, p) as AbsolutePath;
}

export type { AbsolutePath };
export { getAbsolutePath };
