import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/templateStrings/error-octal-literal.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
