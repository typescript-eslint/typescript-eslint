import { debug } from 'debug';
import { filePathToNamespace } from './filePathToNamespace';

export function debugForFile(filePath: string) {
  return debug(filePathToNamespace(filePath));
}
