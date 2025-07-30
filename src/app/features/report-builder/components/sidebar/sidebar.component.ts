import { Component } from '@angular/core';
import { COMPONENT_TYPES } from '../../../../models/component-types';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  componentTypes = COMPONENT_TYPES;

  onDragStart(event: DragEvent, type: string) {
    event.dataTransfer?.setData('componentType', type);
  }
}
