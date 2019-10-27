import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
