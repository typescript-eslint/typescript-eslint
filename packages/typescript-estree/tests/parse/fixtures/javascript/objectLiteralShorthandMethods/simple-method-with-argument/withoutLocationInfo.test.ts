import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/objectLiteralShorthandMethods/simple-method-with-argument.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
