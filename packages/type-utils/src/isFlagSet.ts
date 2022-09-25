export function isFlagSet(obj: { flags: number }, flag: number): boolean {
  return (obj.flags & flag) !== 0;
}
