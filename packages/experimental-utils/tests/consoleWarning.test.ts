describe('importing', () => {
  it('should console a warning', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    require('../src/index');
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenLastCalledWith(
      'You should switch to importing from that non-experimental package instead.',
    );
  });
});
