import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/namespaces-and-modules/shorthand-ambient-module-declaration.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
