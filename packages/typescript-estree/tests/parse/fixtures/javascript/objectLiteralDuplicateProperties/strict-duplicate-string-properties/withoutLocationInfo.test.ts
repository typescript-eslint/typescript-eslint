import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/objectLiteralDuplicateProperties/strict-duplicate-string-properties.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
