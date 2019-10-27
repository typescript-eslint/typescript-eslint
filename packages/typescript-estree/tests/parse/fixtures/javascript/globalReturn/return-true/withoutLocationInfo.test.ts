import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/globalReturn/return-true.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
