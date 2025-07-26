import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { InputFormComponent } from './components/input-form/input-form.component';
import { ResultsDisplayComponent } from './components/results-display/results-display.component';
import { CalculationService } from './services/calculation.service';
import { ImovelData } from './models/imovel-data.interface';
import { CalculatedResults } from './models/calculated-results.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, InputFormComponent, ResultsDisplayComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Calculadora de Leilão de Imóveis';
  
  calculatedResults: CalculatedResults | null = null;
  formData: ImovelData | null = null;

  constructor(private calculationService: CalculationService) {}

  onFormSubmit(data: ImovelData) {
    this.formData = data;
    this.calculatedResults = this.calculationService.calcularResultados(data);
  }
}

