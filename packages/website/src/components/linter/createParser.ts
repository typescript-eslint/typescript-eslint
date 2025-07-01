import type * as tsvfs from '@site/src/vendor/typescript-vfs';
import type { ParserOptions } from '@typescript-eslint/types';
import type { Parser } from '@typescript-eslint/utils/ts-eslint';
import type * as ts from 'typescript';

import type {
  ParseSettings,
  PlaygroundSystem,
  RegisterFile,
  UpdateModel,
  WebLinterModule,
} from './types';

import { defaultParseSettings } from './config';

export function createParser(
  system: PlaygroundSystem,
  compilerOptions: ts.CompilerOptions,
  onUpdate: (filename: string, model: UpdateModel) => void,
  utils: WebLinterModule,
  vfs: typeof tsvfs,
): {
  updateConfig: (compilerOptions: ts.CompilerOptions) => void;
  registerFile: RegisterFile;
} & Parser.ParserModule {
  const createEnv = (
    compilerOptions: ts.CompilerOptions,
  ): tsvfs.VirtualTypeScriptEnvironment => {
    return vfs.createVirtualTypeScriptEnvironment(
      system,
      system.getScriptFileNames(),
      window.ts,
      compilerOptions,
    );
  };

  let compilerHost = createEnv(compilerOptions);

  return {
    parseForESLint: (
      text: string,
      options: ParserOptions = {},
    ): Parser.ParseResult => {
      const filePath = options.filePath ?? '/input.ts';

      // if text is empty use empty line to avoid error
      const code = text || '\n';

      if (compilerHost.getSourceFile(filePath)) {
        compilerHost.updateFile(filePath, code);
      } else {
        compilerHost.createFile(filePath, code);
      }

      const parseSettings: ParseSettings = {
        ...defaultParseSettings,
        code,
        codeFullText: code,
        filePath,
      };

      const program = compilerHost.languageService.getProgram();
      if (!program) {
        throw new Error('Failed to get program');
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tsAst = program.getSourceFile(filePath)!;

      const converted = utils.astConverter(tsAst, parseSettings, true);

      const scopeManager = utils.analyze(converted.estree, {
        globalReturn: options.ecmaFeatures?.globalReturn ?? false,
        sourceType: options.sourceType ?? 'module',
      });

      const checker = program.getTypeChecker();
      const compilerOptions = program.getCompilerOptions();

      onUpdate(filePath, {
        storedAST: converted.estree,
        storedScope: scopeManager,
        storedTsAST: tsAst,
        typeChecker: checker,
      });

      return {
        ast: converted.estree,
        scopeManager,
        services: {
          emitDecoratorMetadata: compilerOptions.emitDecoratorMetadata ?? false,
          esTreeNodeToTSNodeMap: converted.astMaps.esTreeNodeToTSNodeMap,
          experimentalDecorators:
            compilerOptions.experimentalDecorators ?? false,
          getSymbolAtLocation: node =>
            checker.getSymbolAtLocation(
              converted.astMaps.esTreeNodeToTSNodeMap.get(node),
            ),
          getTypeAtLocation: node =>
            checker.getTypeAtLocation(
              converted.astMaps.esTreeNodeToTSNodeMap.get(node),
            ),
          isolatedDeclarations: compilerOptions.isolatedDeclarations ?? false,
          program,
          tsNodeToESTreeNodeMap: converted.astMaps.tsNodeToESTreeNodeMap,
        },
        visitorKeys: utils.visitorKeys,
      };
    },
    registerFile(filePath: string, code: string): void {
      compilerHost.createFile(filePath, code);
    },
    updateConfig(compilerOptions): void {
      compilerHost = createEnv(compilerOptions);
    },
  };
}
