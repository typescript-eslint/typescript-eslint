import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
