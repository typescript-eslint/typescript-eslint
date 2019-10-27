import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/templateStrings/simple-template-string.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
