import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/experimentalObjectRestSpread/invalid-rest-trailing-comma.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
