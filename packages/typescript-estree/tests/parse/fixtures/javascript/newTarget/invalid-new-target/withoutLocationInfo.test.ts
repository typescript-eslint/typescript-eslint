import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/newTarget/invalid-new-target.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
