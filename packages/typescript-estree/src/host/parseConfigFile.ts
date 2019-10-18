import path from 'path';
import ts from 'typescript';

type RawJsonConfig =
  | ts.TsConfigSourceFile
  // internal typescript API - https://github.com/microsoft/TypeScript/blob/1bfc47252fa2c02416dec8417723e247faae466d/src/compiler/types.ts#L2893
  | { parseDiagnostics: { messageText: string }[] };

function parseConfigFile(tsconfigPath: string): ts.ParsedCommandLine {
  const rawConfigSource = ts.readJsonConfigFile(tsconfigPath, path =>
    ts.sys.readFile(path),
  ) as RawJsonConfig;
  if (
    'parseDiagnostics' in rawConfigSource &&
    rawConfigSource.parseDiagnostics &&
    rawConfigSource.parseDiagnostics.length > 0
  ) {
    throw new Error(rawConfigSource.parseDiagnostics[0].messageText);
  }

  const configFile = ts.parseJsonSourceFileConfigFileContent(
    rawConfigSource as ts.TsConfigSourceFile,
    ts.sys,
    path.dirname(tsconfigPath),
    {}, // TODO - extended options
  );

  return configFile;
}

export { parseConfigFile };
