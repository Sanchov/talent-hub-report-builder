import { ControlArrayToFormGroupsPipe } from './control-array-to-form-groups.pipe';

describe('ControlArrayToFormGroupsPipe', () => {
  it('create an instance', () => {
    const pipe = new ControlArrayToFormGroupsPipe();
    expect(pipe).toBeTruthy();
  });
});
