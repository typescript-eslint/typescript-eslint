import { registerNativeBackend } from '../nativeParserRegistry';
import { clearNativeProjectService } from './createNativeProjectService';
import { parseAndGenerateNativeServices } from './parseAndGenerateNativeServices';

registerNativeBackend({
  clearProjectService: clearNativeProjectService,
  parse: parseAndGenerateNativeServices,
});
