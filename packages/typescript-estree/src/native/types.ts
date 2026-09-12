import type { SourceFile } from '@typescript/native/unstable/ast';
import type {
  Checker,
  Program,
  Project,
} from '@typescript/native/unstable/sync';

export interface NativeProjectContext {
  checker: Checker;
  program: Program;
  project: Project;
  sourceFile: SourceFile;
}

export interface NativeProjectService {
  close(): void;
  openFile(filePath: string, code: string): NativeProjectContext;
}
