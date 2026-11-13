import { Component, input } from '@angular/core';
import { OccurrenceStatus, STATUS_ICON, STATUS_LABEL } from '../models/occurrence';

@Component({
  selector: 'app-status',
  template: '<span class="status" [class]="status()"><span aria-hidden="true">{{ icon[status()] }}</span> {{ label[status()] }}</span>',
  styles: [`.status { display:inline-flex; align-items:center; gap:.4rem; padding:.3rem .7rem; border-radius:1rem; font-weight:700; background:#e8edfa; color:#173c78 }
    .em_analise { background:#fff0c2; color:#704900 } .concluida { background:#d8f3df; color:#145a2d }`],
})
export class StatusComponent {
  readonly status = input.required<OccurrenceStatus>();
  protected readonly label = STATUS_LABEL;
  protected readonly icon = STATUS_ICON;
}
