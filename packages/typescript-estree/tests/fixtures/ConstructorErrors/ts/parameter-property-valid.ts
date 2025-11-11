class Valid1 {
  constructor(private foo: number) {}
}
class Valid2 {
  constructor(private foo = 1) {}
}
class Valid3 {
  constructor(public readonly bar?: string) {}
}
