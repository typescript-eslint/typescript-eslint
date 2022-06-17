import * as ts from 'typescript';

export declare class TypeScriptWorker implements ts.LanguageServiceHost {
  private _ctx;
  private _extraLibs;
  private _languageService;
  private _compilerOptions;
  constructor(ctx: any, createData: any);
  getCompilationSettings(): ts.CompilerOptions;
  getScriptFileNames(): string[];
  private _getModel;
  getScriptVersion(fileName: string): string;
  getScriptSnapshot(fileName: string): ts.IScriptSnapshot | undefined;
  getScriptKind?(fileName: string): ts.ScriptKind;
  getCurrentDirectory(): string;
  getDefaultLibFileName(options: ts.CompilerOptions): string;
  isDefaultLibFileName(fileName: string): boolean;
  private static clearFiles;
  getSyntacticDiagnostics(fileName: string): Promise<ts.Diagnostic[]>;
  getSemanticDiagnostics(fileName: string): Promise<ts.Diagnostic[]>;
  getSuggestionDiagnostics(
    fileName: string,
  ): Promise<ts.DiagnosticWithLocation[]>;
  getCompilerOptionsDiagnostics(fileName: string): Promise<ts.Diagnostic[]>;
  getCompletionsAtPosition(
    fileName: string,
    position: number,
  ): Promise<ts.CompletionInfo | undefined>;
  getCompletionEntryDetails(
    fileName: string,
    position: number,
    entry: string,
  ): Promise<ts.CompletionEntryDetails | undefined>;
  getSignatureHelpItems(
    fileName: string,
    position: number,
  ): Promise<ts.SignatureHelpItems | undefined>;
  getQuickInfoAtPosition(
    fileName: string,
    position: number,
  ): Promise<ts.QuickInfo | undefined>;
  getOccurrencesAtPosition(
    fileName: string,
    position: number,
  ): Promise<ReadonlyArray<ts.ReferenceEntry> | undefined>;
  getDefinitionAtPosition(
    fileName: string,
    position: number,
  ): Promise<ReadonlyArray<ts.DefinitionInfo> | undefined>;
  getReferencesAtPosition(
    fileName: string,
    position: number,
  ): Promise<ts.ReferenceEntry[] | undefined>;
  getNavigationBarItems(fileName: string): Promise<ts.NavigationBarItem[]>;
  getFormattingEditsForDocument(
    fileName: string,
    options: ts.FormatCodeOptions,
  ): Promise<ts.TextChange[]>;
  getFormattingEditsForRange(
    fileName: string,
    start: number,
    end: number,
    options: ts.FormatCodeOptions,
  ): Promise<ts.TextChange[]>;
  getFormattingEditsAfterKeystroke(
    fileName: string,
    postion: number,
    ch: string,
    options: ts.FormatCodeOptions,
  ): Promise<ts.TextChange[]>;
  findRenameLocations(
    fileName: string,
    positon: number,
    findInStrings: boolean,
    findInComments: boolean,
    providePrefixAndSuffixTextForRename: boolean,
  ): Promise<readonly ts.RenameLocation[] | undefined>;
  getRenameInfo(
    fileName: string,
    positon: number,
    options: ts.RenameInfoOptions,
  ): Promise<ts.RenameInfo>;
  getEmitOutput(fileName: string): Promise<ts.EmitOutput>;
  getCodeFixesAtPosition(
    fileName: string,
    start: number,
    end: number,
    errorCodes: number[],
    formatOptions: ts.FormatCodeOptions,
  ): Promise<ReadonlyArray<ts.CodeFixAction>>;
  updateExtraLibs(extraLibs: IExtraLibs): void;
  /**
   * https://github.com/microsoft/TypeScript-Website/blob/246798df5013036bd9b4389932b642c20ab35deb/packages/playground-worker/types.d.ts#L48
   */
  getLibFiles(): Promise<Record<string, string>>;
}
export interface IExtraLib {
  content: string;
  version: number;
}
export interface IExtraLibs {
  [path: string]: IExtraLib;
}
