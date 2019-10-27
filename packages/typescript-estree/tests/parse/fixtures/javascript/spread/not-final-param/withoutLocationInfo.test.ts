import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/spread/not-final-param.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
