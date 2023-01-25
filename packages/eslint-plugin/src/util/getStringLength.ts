import GraphemeSplitter from 'grapheme-splitter';

let splitter: GraphemeSplitter;

function isASCII(value: string): boolean {
  return /^[\u0020-\u007f]*$/u.test(value);
}

export function getStringLength(value: string): number {
  if (isASCII(value)) {
    return value.length;
  }

  splitter ??= new GraphemeSplitter();

  return splitter.countGraphemes(value);
}
