import type * as ts from 'typescript/lib/tsserverlibrary';

/**
 * Undocumented TypeScript methods a project service's document registry uses
 * as an external cache of parsed source files.
 *
 * @see https://github.com/microsoft/TypeScript/blob/v6.0.3/src/server/editorServices.ts#L1530-L1540
 */
interface DocumentCache {
  getDocument?: (key: string, path: ts.Path) => ts.SourceFile | undefined;
  setDocument?: (key: string, path: ts.Path, sourceFile: ts.SourceFile) => void;
}

let previousDeclarationFiles = new Map<string, ts.SourceFile>();

/**
 * Lets a new project service reuse the declaration files that the previous one
 * already parsed, instead of parsing them again.
 *
 * Files are kept for one service only, not built up across services.
 */
export function reuseDeclarationFiles(
  _service: ts.server.ProjectService,
  jsDocParsingMode: ts.JSDocParsingMode | undefined,
): void {
  const service = _service as ts.server.ProjectService & DocumentCache;

  if (!service.getDocument || !service.setDocument) {
    return;
  }

  const originalGetDocument = service.getDocument.bind(service);
  const originalSetDocument = service.setDocument.bind(service);

  const reusable = previousDeclarationFiles;
  const declarationFiles = new Map<string, ts.SourceFile>();

  previousDeclarationFiles = declarationFiles;

  const toCacheKey = (key: string, path: ts.Path): string =>
    `${jsDocParsingMode}|${key}|${path}`;

  service.getDocument = (key, path) => {
    const cachedSourceFile = originalGetDocument(key, path);

    if (cachedSourceFile) {
      return cachedSourceFile;
    }

    const cacheKey = toCacheKey(key, path);
    const reusedSourceFile = reusable.get(cacheKey);

    if (
      !reusedSourceFile ||
      reusedSourceFile.fileName !== service.getScriptInfoForPath(path)?.fileName
    ) {
      return undefined;
    }

    // TypeScript won't call setDocument for a reused file, so keep it for the next service here.
    declarationFiles.set(cacheKey, reusedSourceFile);

    return reusedSourceFile;
  };

  service.setDocument = (key, path, sourceFile) => {
    originalSetDocument(key, path, sourceFile);

    if (sourceFile.isDeclarationFile) {
      declarationFiles.set(toCacheKey(key, path), sourceFile);
    }
  };
}
