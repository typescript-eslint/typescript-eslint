// TODO: This fixture might be too large, and if so should be split up.

class foo</* aaa */ A /* bbb */> extends bar</* aaa */ A /* bbb */> {}
class foo2<
  /* aaa */ A /* bbb */ = 2 /* bbb */,
> extends bar</* aaa */ A /* bbb */> {}
interface bar</* aaa */ A /* bbb */> extends bar2</* aaa */ A /* bbb */> {}
interface bar2</* aaa */ A /* bbb */ = 2 /* bbb */>
  extends bar</* aaa */ A /* bbb */> {}
