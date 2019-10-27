import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
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
