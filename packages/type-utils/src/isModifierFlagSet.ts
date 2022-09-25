import type { Declaration, ModifierFlags, Node } from 'typescript';
import { getCombinedModifierFlags } from 'typescript';

export function isModifierFlagSet(node: Node, flag: ModifierFlags): boolean {
  return (getCombinedModifierFlags(<Declaration>node) & flag) !== 0;
}
