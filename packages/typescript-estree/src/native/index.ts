import type { NativeProjectService } from './types';

import { registerNativeProjectServiceClearer } from '../clear-caches';
import { createNativeProjectService } from './createNativeProjectService';

export { createNativeProjectService } from './createNativeProjectService';
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
