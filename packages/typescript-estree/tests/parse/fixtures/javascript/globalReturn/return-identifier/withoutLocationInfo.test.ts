import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/globalReturn/return-identifier.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
