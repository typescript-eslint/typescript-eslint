// TODO: This fixture might be too large, and if so should be split up.

({ __: null });

({ __() {} });

({ ['__']: null });

class X {
  '__' = null;
}
