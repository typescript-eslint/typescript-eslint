import type { SourceFile } from '@typescript/native/ast';
import type { API, Project } from '@typescript/native/sync';

export interface NativeProjectContext {
  api: API;
  configFileName: string;
  project: Project;
  sourceFile: SourceFile;
}

export interface NativeProjectService {
  close(): void;
  openFile(filePath: string, code: string): NativeProjectContext;
}
