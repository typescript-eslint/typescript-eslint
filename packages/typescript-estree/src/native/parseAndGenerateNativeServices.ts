import type { ParseAndGenerateServicesResult } from '../parser';
import type { TSESTreeOptions } from '../parser-options';
import type { ParseSettings } from '../parseSettings';

import { astConverter } from '../ast-converter';
import { convertError } from '../convert';
import { createParserServices } from '../createParserServices';
import { getFirstSemanticOrSyntacticError } from '../semantic-or-syntactic-errors';
import { getNativeProjectService } from './index';
import { createNativeNodeAdapter } from './nativeNodeAdapter';
import { createNativeProgram } from './nativeProgramAdapter';

export function parseAndGenerateNativeServices<
  T extends TSESTreeOptions = TSESTreeOptions,
>(parseSettings: ParseSettings): ParseAndGenerateServicesResult<T> {
  const context = getNativeProjectService().openFile(
    parseSettings.filePath,
    parseSettings.codeFullText,
  );
  const getSyntacticDiagnostics = () =>
    context.program.getSyntacticDiagnostics(context.sourceFile.fileName);
  const nodeAdapter = createNativeNodeAdapter(getSyntacticDiagnostics);
  const sourceFile = nodeAdapter.adaptSourceFile(context.sourceFile);
  const { astMaps, estree } = astConverter(sourceFile, parseSettings, true);
  const program = createNativeProgram({ context, nodeAdapter });

  if (parseSettings.errorOnTypeScriptSyntacticAndSemanticIssues) {
    const error = getFirstSemanticOrSyntacticError(program, sourceFile);
    if (error) {
      throw convertError({ ...error, file: sourceFile });
    }
  }

  return {
    ast: estree as ParseAndGenerateServicesResult<T>['ast'],
    services: createParserServices(astMaps, program),
  };
}
