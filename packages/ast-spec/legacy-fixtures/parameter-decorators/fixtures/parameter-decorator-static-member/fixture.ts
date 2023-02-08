// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

class StaticGreeter {
  static greet(@required name: string) {
    return 'Hello ' + name + '!';
  }
}
