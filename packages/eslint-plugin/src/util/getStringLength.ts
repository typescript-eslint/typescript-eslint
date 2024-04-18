import { countGrapheme } from 'unicode-segmenter/grapheme';

function isASCII(value: string): boolean {
  return /^[\u0020-\u007f]*$/u.test(value);
}

export function getStringLength(value: string): number {
  if (isASCII(value)) {
    return value.length;
  }

  return countGrapheme(value);
}
