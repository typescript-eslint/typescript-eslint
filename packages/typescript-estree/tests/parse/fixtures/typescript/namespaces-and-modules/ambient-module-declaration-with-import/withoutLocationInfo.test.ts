import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
