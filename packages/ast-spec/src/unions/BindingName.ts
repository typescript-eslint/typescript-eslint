import type { Identifier } from '../expression/Identifier/spec';
import type { BindingPattern } from './BindingPattern';

export type BindingName = BindingPattern | Identifier;
