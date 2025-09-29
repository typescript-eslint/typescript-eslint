import packageJson from '../../../../package.json';
import { SUPPORTED_TYPESCRIPT_VERSIONS } from '../../src/parseSettings/warnAboutTSVersion';

it('The SUPPORTED_TYPESCRIPT_VERSIONS value must match the typescript dependency range declared in the root package.json', () => {
  expect(SUPPORTED_TYPESCRIPT_VERSIONS).toBe(
    packageJson.devDependencies.typescript,
  );
});
