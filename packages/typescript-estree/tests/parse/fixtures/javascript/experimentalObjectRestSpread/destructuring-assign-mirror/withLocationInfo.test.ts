import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
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
