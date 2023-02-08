// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

({ __: null });

({ __() {} });

({ ['__']: null });

class X {
  '__' = null;
}
