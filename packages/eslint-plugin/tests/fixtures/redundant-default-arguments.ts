export function importedWithDefault(value = 0): void {}

export function importedWithOptions({ value = 5 }: { value?: number }): void {}

export function ImportedComponent({ value = 5 }: { value?: number }): null {
  return null;
}
