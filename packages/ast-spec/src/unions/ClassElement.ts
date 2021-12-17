import type { MethodDefinition } from '../element/MethodDefinition/spec';
import type { PropertyDefinition } from '../element/PropertyDefinition/spec';
import type { StaticBlock } from '../element/StaticBlock/spec';
import type { TSAbstractMethodDefinition } from '../element/TSAbstractMethodDefinition/spec';
import type { TSAbstractPropertyDefinition } from '../element/TSAbstractPropertyDefinition/spec';
import type { TSIndexSignature } from '../element/TSIndexSignature/spec';

export type ClassElement =
  | MethodDefinition
  | PropertyDefinition
  | StaticBlock
  | TSAbstractMethodDefinition
  | TSAbstractPropertyDefinition
  | TSIndexSignature;
