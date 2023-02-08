// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

class foo</* aaa */ A /* bbb */> extends bar</* aaa */ A /* bbb */> {}
class foo2<
  /* aaa */ A /* bbb */ = 2 /* bbb */,
> extends bar</* aaa */ A /* bbb */> {}
interface bar</* aaa */ A /* bbb */> extends bar2</* aaa */ A /* bbb */> {}
interface bar2</* aaa */ A /* bbb */ = 2 /* bbb */>
  extends bar</* aaa */ A /* bbb */> {}
