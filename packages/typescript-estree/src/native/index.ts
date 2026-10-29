import { version } from '@typescript/native/package.json';
import semver from 'semver';

import { registerNativeBackend } from '../nativeParserRegistry';
import { clearNativeProjectService } from './createNativeProjectService';
import { parseAndGenerateNativeServices } from './parseAndGenerateNativeServices';

const SUPPORTED_VERSIONS = '>=7.1.0-dev.20261001.1 || >=7.1.0-beta <7.1.0-dev';

if (
  !semver.satisfies(version, SUPPORTED_VERSIONS, { includePrerelease: true })
) {
  throw new Error(
    `@typescript/native ${version} is not supported; the experimental tsgo backend needs ${SUPPORTED_VERSIONS}.`,
  );
}

registerNativeBackend({
  clearProjectService: clearNativeProjectService,
  parse: parseAndGenerateNativeServices,
});
