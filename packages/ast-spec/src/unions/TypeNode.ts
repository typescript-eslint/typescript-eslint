import type { TSAbstractKeyword } from '../type/TSAbstractKeyword/spec';
import type { TSAnyKeyword } from '../type/TSAnyKeyword/spec';
import type { TSArrayType } from '../type/TSArrayType/spec';
import type { TSAsyncKeyword } from '../type/TSAsyncKeyword/spec';
import type { TSBigIntKeyword } from '../type/TSBigIntKeyword/spec';
import type { TSBooleanKeyword } from '../type/TSBooleanKeyword/spec';
import type { TSConditionalType } from '../type/TSConditionalType/spec';
import type { TSConstructorType } from '../type/TSConstructorType/spec';
import type { TSDeclareKeyword } from '../type/TSDeclareKeyword/spec';
import type { TSExportKeyword } from '../type/TSExportKeyword/spec';
import type { TSFunctionType } from '../type/TSFunctionType/spec';
import type { TSImportType } from '../type/TSImportType/spec';
import type { TSIndexedAccessType } from '../type/TSIndexedAccessType/spec';
import type { TSInferType } from '../type/TSInferType/spec';
import type { TSIntersectionType } from '../type/TSIntersectionType/spec';
import type { TSIntrinsicKeyword } from '../type/TSIntrinsicKeyword/spec';
import type { TSLiteralType } from '../type/TSLiteralType/spec';
import type { TSMappedType } from '../type/TSMappedType/spec';
import type { TSNamedTupleMember } from '../type/TSNamedTupleMember/spec';
import type { TSNeverKeyword } from '../type/TSNeverKeyword/spec';
import type { TSNullKeyword } from '../type/TSNullKeyword/spec';
import type { TSNumberKeyword } from '../type/TSNumberKeyword/spec';
import type { TSObjectKeyword } from '../type/TSObjectKeyword/spec';
import type { TSOptionalType } from '../type/TSOptionalType/spec';
import type { TSPrivateKeyword } from '../type/TSPrivateKeyword/spec';
import type { TSProtectedKeyword } from '../type/TSProtectedKeyword/spec';
import type { TSPublicKeyword } from '../type/TSPublicKeyword/spec';
import type { TSQualifiedName } from '../type/TSQualifiedName/spec';
import type { TSReadonlyKeyword } from '../type/TSReadonlyKeyword/spec';
import type { TSRestType } from '../type/TSRestType/spec';
import type { TSStaticKeyword } from '../type/TSStaticKeyword/spec';
import type { TSStringKeyword } from '../type/TSStringKeyword/spec';
import type { TSSymbolKeyword } from '../type/TSSymbolKeyword/spec';
import type { TSTemplateLiteralType } from '../type/TSTemplateLiteralType/spec';
import type { TSThisType } from '../type/TSThisType/spec';
import type { TSTupleType } from '../type/TSTupleType/spec';
import type { TSTypeLiteral } from '../type/TSTypeLiteral/spec';
import type { TSTypeOperator } from '../type/TSTypeOperator/spec';
import type { TSTypePredicate } from '../type/TSTypePredicate/spec';
import type { TSTypeQuery } from '../type/TSTypeQuery/spec';
import type { TSTypeReference } from '../type/TSTypeReference/spec';
import type { TSUndefinedKeyword } from '../type/TSUndefinedKeyword/spec';
import type { TSUnionType } from '../type/TSUnionType/spec';
import type { TSUnknownKeyword } from '../type/TSUnknownKeyword/spec';
import type { TSVoidKeyword } from '../type/TSVoidKeyword/spec';

export type TypeNode =
  | TSAbstractKeyword
  | TSAnyKeyword
  | TSArrayType
  | TSAsyncKeyword
  | TSBigIntKeyword
  | TSBooleanKeyword
  | TSConditionalType
  | TSConstructorType
  | TSDeclareKeyword
  | TSExportKeyword
  | TSFunctionType
  | TSImportType
  | TSIndexedAccessType
  | TSInferType
  | TSIntersectionType
  | TSIntrinsicKeyword
  | TSLiteralType
  | TSMappedType
  | TSNamedTupleMember
  | TSNeverKeyword
  | TSNullKeyword
  | TSNumberKeyword
  | TSObjectKeyword
  | TSOptionalType
  | TSPrivateKeyword
  | TSProtectedKeyword
  | TSPublicKeyword
  | TSQualifiedName
  | TSReadonlyKeyword
  | TSRestType
  | TSStaticKeyword
  | TSStringKeyword
  | TSSymbolKeyword
  | TSTemplateLiteralType
  | TSThisType
  | TSTupleType
  | TSTypeLiteral
  | TSTypeOperator
  | TSTypePredicate
  | TSTypeQuery
  | TSTypeReference
  | TSUndefinedKeyword
  | TSUnionType
  | TSUnknownKeyword
  | TSVoidKeyword;
