import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/newTarget/simple-new-target.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
