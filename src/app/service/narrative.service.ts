import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NarrativeService {
  private readonly NARRATIVE_PREFIX = '$narrative(';
  private readonly NARRATIVE_SUFFIX = ')';

  parse(narrative: string): {
    title: string;
    traitName: string;
    traitValue?: string;
  } {
    if (!this.isNarrative(narrative)) {
      return { title: '', traitName: '', traitValue: '' };
    }

    const content = narrative.substring(
      this.NARRATIVE_PREFIX.length,
      narrative.length - this.NARRATIVE_SUFFIX.length
    );
    const parts = content.split(',');

    return {
      title: parts[0]?.trim() || '',
      traitName: parts[1]?.trim() || '',
      traitValue: parts[2]?.trim() || undefined,
    };
  }

  format(title: string, traitName: string, traitValue?: string): string {
    if (!title && !traitName) return '';

    const components = [
      title || '',
      traitName || '',
      ...(traitValue ? [traitValue] : []),
    ];

    return `${this.NARRATIVE_PREFIX}${components.join(',')}${
      this.NARRATIVE_SUFFIX
    }`;
  }

  
  isNarrative(str: string): boolean {
    return (
      str?.startsWith(this.NARRATIVE_PREFIX) &&
      str?.endsWith(this.NARRATIVE_SUFFIX)
    );
  }
}
