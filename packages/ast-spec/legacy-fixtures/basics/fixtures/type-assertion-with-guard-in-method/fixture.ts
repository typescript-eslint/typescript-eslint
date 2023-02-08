// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

class AssertsFoo {
  isBar(): asserts this is string {
    return;
  }
  isBaz = (): asserts this is string => {
    return;
  };
}
