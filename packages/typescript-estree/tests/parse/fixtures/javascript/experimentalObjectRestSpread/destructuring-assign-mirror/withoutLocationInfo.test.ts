import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/experimentalObjectRestSpread/destructuring-assign-mirror.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
