function processOptional(s?: string) {
  let len = s?.length;
  let find = s?.includes('foo');
  let element = s?.[0];
}
