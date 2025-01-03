export function filePathToNamespace(filePath: string) {
  const matched = /@typescript-eslint[\\\/]+([a-z-]+)[\\\/]+(.+)/g.exec(
    filePath,
  )!;
  const [, packageName, relativeFilePath] = matched;

  const relativeFilePathProcessed = relativeFilePath
    .replace(/^(?:dist|lib|src)\//, '')
    .replace(/\.\w+$/g, '')
    .replaceAll(/[^a-z0-9-]+/gi, ':');

  return `typescript-eslint:${packageName}:${relativeFilePathProcessed}`;
}
