export type ImportedResult = string | null;

export interface ImportedBox<T> {
  readonly value: T;
}

export type ImportedEnvelope<T> = Promise<Readonly<ImportedBox<T>>>;

export declare const importedTextBox: ImportedBox<string>;

export let importedMutableValue: string | null = 'ready';

export declare function mutateImportedValue(): void;
