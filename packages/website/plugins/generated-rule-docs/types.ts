import type {
  RuleMetaData,
  RuleMetaDataDocs,
} from '@typescript-eslint/utils/ts-eslint';
import type { VFile } from 'vfile';

export type RuleMetaDataWithDocs = RuleMetaData<string> & {
  docs: RuleMetaDataDocs;
};

export function isRuleMetaDataDocs(
  meta: RuleMetaData<string> | undefined,
): meta is RuleMetaDataWithDocs {
  return !!meta?.docs;
}

export type VFileWithStem = VFile & {
  stem: string;
};

export function isVFileWithStem(file: VFile): file is VFileWithStem {
  return !!file.stem;
}
