// eslint-disable-next-line @typescript-eslint/internal/no-relative-paths-to-internal-packages
import packageJson from '../../../../package.json';
import { SUPPORTED_TYPESCRIPT_VERSIONS } from '../../src/parseSettings/warnAboutTSVersion';

it('The SUPPORTED_TYPESCRIPT_VERSIONS value must match the typescript dependency range declared in the root package.json', () => {
  expect(SUPPORTED_TYPESCRIPT_VERSIONS).toEqual(
    packageJson.devDependencies.typescript,
  );
});
