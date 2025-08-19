import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-json-parser',
  templateUrl: './json-parser.component.html',
  styleUrls: ['./json-parser.component.scss'],
})
export class JsonParserComponent {
  @Output() jsonParsed = new EventEmitter<any>();
  @Output() parseError = new EventEmitter<Error>();
  @Input() set formJson(json: string) {
    if (!this.isTextareaFocused && json) {
      this.updateJsonPreview(json);
    }
  }

  jsonForm: FormGroup;
  errorMessage: string | null = null;
  parsedJson: any = null;
  isTextareaFocused = false;
  showSyntaxHelp = false;

  constructor(private fb: FormBuilder) {
    this.jsonForm = this.fb.group({
      jsonInput: ['', [Validators.required, this.jsonValidator]],
    });
  }

  private jsonValidator(control: { value: string }) {
    try {
      if (control.value) {
        JSON.parse(control.value);
      }
      return null;
    } catch (error) {
      return { invalidJson: true };
    }
  }

  parseJson() {
    this.errorMessage = null;
    const jsonString = this.jsonForm.value.jsonInput?.trim();

    if (!jsonString) {
      this.errorMessage = 'Please enter some JSON to parse';
      return;
    }

    try {
      this.parsedJson = JSON.parse(jsonString);
      console.log('Parsed JSON:', this.parsedJson);
      this.jsonParsed.emit(this.parsedJson);
    } catch (error: any) {
      this.handleParseError(error, jsonString);
    }
  }

  private handleParseError(error: Error, jsonString: string) {
    console.error('JSON parsing error:', error);
    this.parsedJson = null;

    let errorPosition = 0;
    let errorContext = '';

    if (error instanceof SyntaxError) {
      const positionMatch = error.message.match(/position (\d+)/);
      errorPosition = positionMatch ? parseInt(positionMatch[1], 10) : 0;

      if (errorPosition > 0) {
        const start = Math.max(0, errorPosition - 10);
        const end = Math.min(jsonString.length, errorPosition + 10);
        errorContext = jsonString.substring(start, end);
      }
    }

    this.errorMessage = this.formatErrorMessage(
      error,
      errorPosition,
      errorContext
    );
    this.parseError.emit(error);
  }

  private formatErrorMessage(
    error: Error,
    position: number,
    context: string
  ): string {
    let message = 'Invalid JSON: ';

    if (error.message.includes('Unexpected token')) {
      message += 'Unexpected character in JSON';
    } else if (error.message.includes('Unexpected end')) {
      message += 'Incomplete JSON - unexpected end of input';
    } else {
      message += error.message;
    }

    if (position > 0) {
      message += ` at position ${position}`;
    }

    if (context) {
      message += ` (near: "${context}")`;
    }

    return message;
  }

  clearField() {
    this.jsonForm.reset();
    this.errorMessage = null;
    this.parsedJson = null;
  }

  getParsedJson() {
    return this.parsedJson;
  }

  updateJsonPreview(jsonString: string) {
    this.jsonForm.patchValue({
      jsonInput: jsonString,
    });

    try {
      this.parsedJson = JSON.parse(jsonString);
      this.errorMessage = null;
    } catch (error: any) {
      this.parsedJson = null;
      this.handleParseError(error, jsonString);
    }
  }

  refreshJson(jsonString: string) {
    this.updateJsonPreview(jsonString);
    this.isTextareaFocused = false;
  }

  toggleSyntaxHelp() {
    this.showSyntaxHelp = !this.showSyntaxHelp;
  }
}
