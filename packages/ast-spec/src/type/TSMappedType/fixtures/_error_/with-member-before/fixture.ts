type Mapped = {
  member: member;
  [key in keyof O]: number;
};
