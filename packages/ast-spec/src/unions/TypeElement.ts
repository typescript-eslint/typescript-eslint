import type { TSCallSignatureDeclaration } from '../element/TSCallSignatureDeclaration/spec';
import type { TSConstructSignatureDeclaration } from '../element/TSConstructSignatureDeclaration/spec';
import type { TSIndexSignature } from '../element/TSIndexSignature/spec';
import type { TSMethodSignature } from '../element/TSMethodSignature/spec';
import type { TSPropertySignature } from '../element/TSPropertySignature/spec';

export type TypeElement =
  | TSCallSignatureDeclaration
  | TSConstructSignatureDeclaration
  | TSIndexSignature
  | TSMethodSignature
  | TSPropertySignature;
