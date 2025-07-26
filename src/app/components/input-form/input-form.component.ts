import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImovelData } from '../../models/imovel-data.interface';
import { CALCULATION_CONSTANTS } from '../../constants/calculation-constants';

@Component({
  selector: 'app-input-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input-form.component.html',
  styleUrl: './input-form.component.scss'
})
export class InputFormComponent {
  @Output() formSubmit = new EventEmitter<ImovelData>();

  formData: ImovelData = {
    objetivo: 'alugar',
    valorAvaliacao: 0, // Inicializar com 0 em vez de null
    valorArrematacao: 0, // Inicializar com 0 em vez de null
    seraFinanciado: false,
    usaraAdvogado: false,
    percentualITBI: 2,
    valorDesocupacao: 0, // Inicializar com 0 em vez de null
    valorReforma: 0, // Inicializar com 0 em vez de null
    valorCondominio: 0, // Inicializar com 0 em vez de null
    valorIPTUMensal: 0, // Inicializar com 0 em vez de null
    outrosGastosMensais: 0, // Inicializar com 0 em vez de null
    periodoAnalise: 12
  };

  // Propriedade para controlar se o IPTU foi calculado automaticamente
  iptuCalculadoAutomaticamente = false;

  onSubmit() {
    // Validação básica
    if (!this.formData.valorArrematacao || this.formData.valorArrematacao <= 0) {
      alert('Por favor, informe o valor de arrematação.');
      return;
    }

    if (this.formData.seraFinanciado && (!this.formData.taxaJurosAnual || this.formData.taxaJurosAnual <= 0)) {
      alert('Por favor, informe a taxa de juros do financiamento.');
      return;
    }

    if (this.formData.usaraAdvogado && (!this.formData.honorariosAdvogado || this.formData.honorariosAdvogado <= 0)) {
      alert('Por favor, informe os honorários do advogado.');
      return;
    }

    if (this.formData.objetivo === 'vender' && (!this.formData.valorEstimadoVenda || this.formData.valorEstimadoVenda <= 0)) {
      alert('Por favor, informe o valor estimado de venda.');
      return;
    }

    if (this.formData.objetivo === 'alugar' && (!this.formData.valorAluguelMensal || this.formData.valorAluguelMensal <= 0)) {
      alert('Por favor, informe o valor estimado de aluguel mensal.');
      return;
    }

    // Converter valores 0 para valores válidos antes de enviar
    const formDataToSubmit: ImovelData = {
      ...this.formData,
      valorAvaliacao: this.formData.valorAvaliacao || 0,
      valorArrematacao: this.formData.valorArrematacao || 0,
      valorDesocupacao: this.formData.valorDesocupacao || 0,
      valorReforma: this.formData.valorReforma || 0,
      valorCondominio: this.formData.valorCondominio || 0,
      valorIPTUMensal: this.formData.valorIPTUMensal || 0,
      outrosGastosMensais: this.formData.outrosGastosMensais || 0
    };

    this.formSubmit.emit(formDataToSubmit);
  }

  onObjetivoChange() {
    // Limpar campos condicionais quando o objetivo muda
    this.formData.valorEstimadoVenda = undefined;
    this.formData.valorAluguelMensal = undefined;
  }

  onFinanciamentoChange() {
    // Limpar campos de financiamento quando não será financiado
    if (!this.formData.seraFinanciado) {
      this.formData.taxaJurosAnual = undefined;
      this.formData.valorEntrada = undefined;
      this.formData.prazoFinanciamentoAnos = undefined;
    } else {
      // Definir valores padrão quando financiado
      if (!this.formData.prazoFinanciamentoAnos) {
        this.formData.prazoFinanciamentoAnos = CALCULATION_CONSTANTS.PRAZO_FINANCIAMENTO_PADRAO;
      }
    }
  }

  onAdvogadoChange() {
    // Limpar honorários quando não usar advogado
    if (!this.formData.usaraAdvogado) {
      this.formData.honorariosAdvogado = undefined;
    }
  }

  onValorAvaliacaoChange() {
    // Calcular IPTU automaticamente quando o valor de avaliação muda
    if (this.formData.valorAvaliacao && this.formData.valorAvaliacao > 0) {
      if (!this.formData.valorIPTUMensal || this.iptuCalculadoAutomaticamente) {
        const iptuAnual = this.formData.valorAvaliacao * CALCULATION_CONSTANTS.IPTU_ANUAL_PADRAO;
        this.formData.valorIPTUMensal = Math.round(iptuAnual / 12);
        this.iptuCalculadoAutomaticamente = true;
      }
    }
  }

  onIPTUManualChange() {
    // Marcar que o IPTU foi alterado manualmente
    this.iptuCalculadoAutomaticamente = false;
  }

  // Método para formatar entrada de valores monetários
  onInputFocus(event: any) {
    // Limpar o campo se estiver com valor 0
    if (event.target.value === '0') {
      event.target.value = '';
    }
  }

  // Método para garantir que valores vazios sejam tratados adequadamente
  onInputBlur(event: any, field: keyof ImovelData) {
    if (event.target.value === '' || event.target.value === null) {
      (this.formData as any)[field] = 0;
      event.target.value = '0';
    }
  }
}

