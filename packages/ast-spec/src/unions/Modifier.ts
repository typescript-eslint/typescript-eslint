import type { TSAbstractKeyword } from '../token/TSAbstractKeyword/spec';
import type { TSAsyncKeyword } from '../token/TSAsyncKeyword/spec';
import type { TSPrivateKeyword } from '../token/TSPrivateKeyword/spec';
import type { TSProtectedKeyword } from '../token/TSProtectedKeyword/spec';
import type { TSPublicKeyword } from '../token/TSPublicKeyword/spec';
import type { TSReadonlyKeyword } from '../token/TSReadonlyKeyword/spec';
import type { TSStaticKeyword } from '../token/TSStaticKeyword/spec';

export type Modifier =
  | TSAbstractKeyword
  | TSAsyncKeyword
  | TSPrivateKeyword
  | TSProtectedKeyword
  | TSPublicKeyword
  | TSReadonlyKeyword
  | TSStaticKeyword;
