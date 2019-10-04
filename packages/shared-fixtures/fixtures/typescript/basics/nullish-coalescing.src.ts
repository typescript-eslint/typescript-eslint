function processNullishCoalesce(s?: string) {
  let len = (s ?? '').length;
  let find = (s ?? '').includes('foo');
}
