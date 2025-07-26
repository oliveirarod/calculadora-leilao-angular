import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculatedResults } from '../../models/calculated-results.interface';
import { ImovelData } from '../../models/imovel-data.interface';
import { AlertsComponent } from '../alerts/alerts.component';

@Component({
  selector: 'app-results-display',
  standalone: true,
  imports: [CommonModule, AlertsComponent],
  templateUrl: './results-display.component.html',
  styleUrl: './results-display.component.scss'
})
export class ResultsDisplayComponent {
  @Input() results!: CalculatedResults;
  @Input() formData!: ImovelData;

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatPercentage(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 2
    }).format(value / 100);
  }

  get hasFinanciamento(): boolean {
    return this.formData.seraFinanciado && !!this.results.valorFinanciado;
  }

  get isVenda(): boolean {
    return this.formData.objetivo === 'vender';
  }

  get isAluguel(): boolean {
    return this.formData.objetivo === 'alugar';
  }

  get isUsoProprio(): boolean {
    return this.formData.objetivo === 'uso proprio';
  }
}