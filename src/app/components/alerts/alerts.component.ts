import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Alerta } from '../../models/calculated-results.interface';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.scss'
})
export class AlertsComponent {
  @Input() alertas: Alerta[] = [];

  getAlertIcon(tipo: string): string {
    switch (tipo) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return '📢';
    }
  }
}

