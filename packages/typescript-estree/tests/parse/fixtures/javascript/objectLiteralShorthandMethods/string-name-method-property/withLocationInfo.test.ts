import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/objectLiteralShorthandMethods/string-name-method-property.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
