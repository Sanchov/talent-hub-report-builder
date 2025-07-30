import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Pipe({
  name: 'controlArrayToFormGroups',
  pure: true,
})
export class ControlArrayToFormGroupsPipe implements PipeTransform {
  transform(controls: AbstractControl[] | null): FormGroup[] {
    if (!controls) return [];
    return controls.map((control) => {
      if (control instanceof FormGroup) return control;
      throw new Error('One or more controls are not FormGroup instances');
    });
  }
}
