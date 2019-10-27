import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/decorators/method-decorators/method-decorator-instance-member.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
