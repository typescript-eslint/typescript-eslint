import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
