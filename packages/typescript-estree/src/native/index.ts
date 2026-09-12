import { registerNativeBackend } from '../nativeParserRegistry';
import { clearNativeProjectService } from './createNativeProjectService';
import { parseAndGenerateNativeServices } from './parseAndGenerateNativeServices';

export {
  clearNativeProjectService,
  createNativeProjectService,
  getNativeProjectService,
} from './createNativeProjectService';
export { parseAndGenerateNativeServices } from './parseAndGenerateNativeServices';
export type * from './types';

registerNativeBackend({
  clearProjectService: clearNativeProjectService,
  parse: parseAndGenerateNativeServices,
});
