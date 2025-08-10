import { FormGroup } from '@angular/forms';

export interface DataComponent {
  form: FormGroup;
  data: any;
  isNarrativeField?: (controlName: string) => boolean;
  getNarrativeFields?: (controlName: string) => any;
  onNarrativeInput?: (event: Event, controlName: string, field: string) => void;
}
