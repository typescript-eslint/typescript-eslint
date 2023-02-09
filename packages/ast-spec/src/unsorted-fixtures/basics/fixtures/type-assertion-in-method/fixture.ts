// TODO: This fixture might be too large, and if so should be split up.

class AssertsFoo {
  isBar(): asserts this {
    return;
  }
  isBaz = (): asserts this => {
    return;
  };
}
