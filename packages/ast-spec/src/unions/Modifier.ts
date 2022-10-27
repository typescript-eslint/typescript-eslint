import type { TSAbstractKeyword } from '../type/TSAbstractKeyword/spec';
import type { TSAsyncKeyword } from '../type/TSAsyncKeyword/spec';
import type { TSPrivateKeyword } from '../type/TSPrivateKeyword/spec';
import type { TSProtectedKeyword } from '../type/TSProtectedKeyword/spec';
import type { TSPublicKeyword } from '../type/TSPublicKeyword/spec';
import type { TSReadonlyKeyword } from '../type/TSReadonlyKeyword/spec';
import type { TSStaticKeyword } from '../type/TSStaticKeyword/spec';

export type Modifier =
  | TSAbstractKeyword
  | TSAsyncKeyword
  | TSPrivateKeyword
  | TSProtectedKeyword
  | TSPublicKeyword
  | TSReadonlyKeyword
  | TSStaticKeyword;
