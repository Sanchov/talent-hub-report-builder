// json-parser.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-json-parser',
  templateUrl: './json-parser.component.html',
  styleUrls: ['./json-parser.component.scss'],
})
export class JsonParserComponent {
  @Output() jsonParsed = new EventEmitter<any>();
  jsonForm: FormGroup;
  errorMessage: string | null = null;
  parsedJson: any = null;

  constructor(private fb: FormBuilder) {
    this.jsonForm = this.fb.group({
      jsonInput: ['', Validators.required],
    });
  }

  parseJson() {
    this.errorMessage = null;
    try {
      this.parsedJson = JSON.parse(this.jsonForm.value.jsonInput);
      console.log('Parsed JSON:', this.parsedJson);
      this.jsonParsed.emit(this.parsedJson);
    } catch (error) {
      this.errorMessage = 'Invalid JSON format. Please check your input.';
      console.error('JSON parsing error:', error);
    }
  }

  clearField() {
    this.jsonForm.reset();
    this.errorMessage = null;
    this.parsedJson = null;
  }

  getParsedJson() {
    return this.parsedJson;
  }
}
