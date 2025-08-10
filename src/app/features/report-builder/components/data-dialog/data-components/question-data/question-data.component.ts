import { Component, inject, Input } from '@angular/core';
import {
  FormGroup,
  FormArray,
  AbstractControl,
  FormBuilder,
  FormControl,
} from '@angular/forms';

@Component({
  selector: 'app-question-data',
  templateUrl: './question-data.component.html',
  styleUrl: './question-data.component.scss',
})
export class QuestionDataComponent {
  @Input() form!: FormGroup;
  @Input() data: any;
  private fb = inject(FormBuilder);
  @Input() isNarrativeField!: (controlName: string) => boolean;
  @Input() getNarrativeFields!: (controlName: string) => any;
  @Input() onNarrativeInput!: (
    event: Event,
    controlName: string,
    field: string
  ) => void;
  @Input() isNarrativeFieldFromControl!: (control: any) => boolean;
  @Input() getNarrativeFieldsFromControl!: (control: any) => any;

  @Input() onDatasetNarrativeInput!: (
    event: Event,
    index: number,
    controlName: string,
    field: string
  ) => void;
  @Input() removeDatasetItem!: (controlName: string, index: number) => void;
  @Input() addDatasetItem!: (controlName: string) => void;

  get datasetArray(): FormArray | null {
    return this.form?.get('data.dataset') as FormArray | null;
  }
  getDatasetControls(): FormGroup[] {
    return (this.form.get('data.dataset') as FormArray).controls as FormGroup[];
  }

 
  addQuestionAnswer(questionIndex: number) {
    const questions = this.form.get('data.dataset') as FormArray;
    const answers = questions.at(questionIndex).get('answers') as FormArray;
    answers.push(this.fb.group({ text: '', value: '' }));
  }
  getSelectedValueControl(
    question: AbstractControl,
    index: number
  ): FormControl {
    return (question.get('selectedValues') as FormArray).at(
      index
    ) as FormControl;
  }
  getQuestionAnswers(questionGroup: AbstractControl): FormArray {
  return (questionGroup.get('answers') as FormArray) || this.fb.array([]);
}
  removeQuestionAnswer(questionIndex: number, answerIndex: number) {
    const questions = this.form.get('data.dataset') as FormArray;
    const answers = questions.at(questionIndex).get('answers') as FormArray;
    answers.removeAt(answerIndex);
  }

  getSelectedValues(question: AbstractControl): FormArray {
    return question.get('selectedValues') as FormArray;
  }

  addSelectedValue(questionIndex: number) {
    const questions = this.form.get('data.dataset') as FormArray;
    const selectedValues = questions
      .at(questionIndex)
      .get('selectedValues') as FormArray;
    selectedValues.push(this.fb.control(''));
  }

  removeSelectedValue(questionIndex: number, valueIndex: number) {
    const questions = this.form.get('data.dataset') as FormArray;
    const selectedValues = questions
      .at(questionIndex)
      .get('selectedValues') as FormArray;
    selectedValues.removeAt(valueIndex);
  }
}
