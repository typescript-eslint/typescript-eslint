class F {
  #a;

  m() {
    this.#a++;
    this.m().a++;
    this[1] = 1;
    F++;
    // prettier-ignore
    (this.#a)++;
    (<number>this.#a)++;
    (this.#a satisfies number)++;
    (this.#a as number)++;
    this.#a!++;
  }
}
