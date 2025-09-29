// NOTE: TS2491: The left-hand side of a 'for...in' statement cannot be a destructuring pattern.
// But this is valid JavaScript
for ({ x, y } in []) {
}
for ([x, y] in []) {
}
for (x.y in []) {
}
for (x as T in []) {
}
