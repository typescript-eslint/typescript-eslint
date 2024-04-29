async function unsafeLog(...values: any[]) {
  for (const value of values) {
    console.log(value.toUpperCase());
  }
  return values;
}

unsafeLog();
