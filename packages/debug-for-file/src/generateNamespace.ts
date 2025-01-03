export function generateNamespace(filePath: string, packageName?: string) {
  const filePathProcessed = filePath
    .replace(/^(?:dist|lib|src)\//, '')
    .replace(/\.\w+$/g, '');

  const packageNameProcessed = packageName?.replace('@', '');

  return [packageNameProcessed, filePathProcessed]
    .filter(Boolean)
    .join(':')
    .replaceAll(/[^a-z0-9-]+/gi, ':');
}
