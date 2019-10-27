import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
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
