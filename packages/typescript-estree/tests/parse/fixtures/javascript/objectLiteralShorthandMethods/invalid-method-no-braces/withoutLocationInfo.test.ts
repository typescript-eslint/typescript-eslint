import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/objectLiteralShorthandMethods/invalid-method-no-braces.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
