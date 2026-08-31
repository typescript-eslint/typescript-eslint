import type { SourceFile } from '@typescript/native/unstable/ast';
import type {
  Checker,
  Program,
  Project,
  Snapshot,
} from '@typescript/native/unstable/sync';

export interface NativeFileChanges {
  changed?: string[];
  created?: string[];
  deleted?: string[];
}

export interface NativeProjectContext {
  checker: Checker;
  program: Program;
  project: Project;
  snapshot: Snapshot;
  sourceFile: SourceFile;
}

export interface NativeProjectService {
  close(): void;
  openFile(filePath: string, code: string): NativeProjectContext;
  updateFiles(changes: NativeFileChanges): Snapshot;
}
