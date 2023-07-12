class F {
  #a;

  m() {
    this.#a++;
    this.m().a++;
    this[1] = 1;
    F++;
    this.#a++;
  }
}
