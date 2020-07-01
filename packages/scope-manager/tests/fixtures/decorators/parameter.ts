function decorator() {}
function foo(
  @decorator a,
  @decorator [b],
  @decorator { c },
  @decorator d = 1,
) {}
