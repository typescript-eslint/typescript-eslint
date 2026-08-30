import type { NativeProjectService } from './types';

import { registerNativeProjectServiceClearer } from '../clear-caches';
import { registerNativeParser } from '../parser';
import { createNativeProjectService } from './createNativeProjectService';
import { parseAndGenerateNativeServices } from './parseAndGenerateNativeServices';

export { createNativeProjectService } from './createNativeProjectService';
export { parseAndGenerateNativeServices } from './parseAndGenerateNativeServices';
export type * from './types';

let nativeProjectService: NativeProjectService | undefined;

export function clearNativeProjectService(): void {
  const service = nativeProjectService;
  nativeProjectService = undefined;
  service?.close();
}

export function getNativeProjectService(): NativeProjectService {
  return (nativeProjectService ??= createNativeProjectService());
}

registerNativeProjectServiceClearer(clearNativeProjectService);
registerNativeParser(parseAndGenerateNativeServices);
