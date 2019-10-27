import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
