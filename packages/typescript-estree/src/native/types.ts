import type { SourceFile } from '@typescript/native/unstable/ast';
import type { API, Project } from '@typescript/native/unstable/sync';

export interface NativeProjectContext {
  api: API;
  project: Project;
  sourceFile: SourceFile;
}

export interface NativeProjectService {
  close(): void;
  openFile(filePath: string, code: string): NativeProjectContext;
}
