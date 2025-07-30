import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Pipe({
  name: 'controlToFormGroup',

  pure: true,
})
export class ControlToFormGroupPipe implements PipeTransform {
  transform(control: AbstractControl | null | undefined): FormGroup {
    if (control instanceof FormGroup) {
      return control as FormGroup;
    }
    throw new Error('Control is not a FormGroup');
  }
}
