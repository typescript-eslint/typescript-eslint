import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/namespaces-and-modules/ambient-module-declaration-with-import.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
