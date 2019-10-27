import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/globalReturn/return-no-arg.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
