# Generated Empty Object Compound Types

## Goal

Address unresolved review feedback for `no-generated-empty-object-type` by reporting generated empty object types that appear in unions and intersections, without reporting harmless empty intersection constituents.

## Design

The rule will continue identifying an empty object structurally with TypeScript's type checker. Its predicate will additionally inspect union constituents for an empty object because a `{}` union member makes the union accept any non-nullish value.

An intersection will be checked only as a whole. This reports intersections whose final resolved type is `{}`, while preserving valid intersections in which another constituent contributes properties.

The rule will continue ignoring explicitly written `{}` values inferred through generic calls because no type operation generated those types.

## Testing

Focused invalid cases will cover a distributive utility type producing `{}` inside a union and two generated empty object types forming an empty intersection. The existing valid intersection case will guard against constituent-level false positives.
