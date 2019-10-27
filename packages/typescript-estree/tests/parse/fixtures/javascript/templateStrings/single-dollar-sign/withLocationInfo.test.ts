import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/templateStrings/single-dollar-sign.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
