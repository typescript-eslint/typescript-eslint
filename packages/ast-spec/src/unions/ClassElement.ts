import type { ClassProperty } from '../element/ClassProperty/spec';
import type { MethodDefinition } from '../element/MethodDefinition/spec';
import type { TSAbstractClassProperty } from '../element/TSAbstractClassProperty/spec';
import type { TSAbstractMethodDefinition } from '../element/TSAbstractMethodDefinition/spec';
import type { TSIndexSignature } from '../element/TSIndexSignature/spec';

export type ClassElement =
  | ClassProperty
  | MethodDefinition
  | TSAbstractClassProperty
  | TSAbstractMethodDefinition
  | TSIndexSignature;
