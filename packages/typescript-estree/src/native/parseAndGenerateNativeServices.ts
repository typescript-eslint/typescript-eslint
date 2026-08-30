import type { ParseAndGenerateNativeServicesResult } from '../parser';
import type { TSESTreeOptions } from '../parser-options';
import type { ParseSettings } from '../parseSettings';

import { astConverter } from '../ast-converter';
import { convertError } from '../convert';
import { getFirstNativeSemanticOrSyntacticError } from '../semantic-or-syntactic-errors';
import { createNativeParserServices } from './createNativeParserServices';
import { getNativeProjectService } from './index';
import { createNativeNodeAdapter } from './nativeNodeAdapter';

export function parseAndGenerateNativeServices<
  T extends TSESTreeOptions = TSESTreeOptions,
>(parseSettings: ParseSettings): ParseAndGenerateNativeServicesResult<T> {
  const context = getNativeProjectService().openFile(
    parseSettings.filePath,
    parseSettings.codeFullText,
  );
  const getSyntacticDiagnostics = () =>
    context.program.getSyntacticDiagnostics(context.sourceFile.fileName);
  const adapter = createNativeNodeAdapter(getSyntacticDiagnostics);
  const sourceFile = adapter.adaptSourceFile(context.sourceFile);
  const { astMaps, estree } = astConverter(sourceFile, parseSettings, true);

  if (parseSettings.errorOnTypeScriptSyntacticAndSemanticIssues) {
    const error = getFirstNativeSemanticOrSyntacticError(context);
    if (error) {
      throw convertError({ ...error, file: sourceFile });
    }
  }

  return {
    ast: estree as ParseAndGenerateNativeServicesResult<T>['ast'],
    services: createNativeParserServices(astMaps, adapter, context),
  };
}
