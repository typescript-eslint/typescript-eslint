// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

a<b>;

a<b><c>;
a<b><c>();
a<b><c>?.();
a?.b<c><d>();
new a<b><c>();
