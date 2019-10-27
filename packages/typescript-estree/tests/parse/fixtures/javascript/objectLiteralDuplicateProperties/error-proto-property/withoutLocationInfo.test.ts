import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/objectLiteralDuplicateProperties/error-proto-property.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
