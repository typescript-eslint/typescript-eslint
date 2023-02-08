// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

abstract class AbstractDeclProps {
  declare prop1: string;
  declare abstract prop2: string;
  public declare abstract prop3: string;
  declare abstract readonly prop4: string;
  public declare abstract readonly prop5: string;
}
