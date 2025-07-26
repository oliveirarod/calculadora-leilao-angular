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
    valorAvaliacao: null as any,
    valorArrematacao: null as any,
    seraFinanciado: false,
    usaraAdvogado: false,
    percentualITBI: 2,
    valorDesocupacao: null as any,
    valorReforma: null as any,
    valorCondominio: null as any,
    valorIPTUMensal: null as any,
    outrosGastosMensais: null as any,
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

    // Converter valores null para 0 antes de enviar
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
    this.formData.valorEstimadoVenda = null as any;
    this.formData.valorAluguelMensal = null as any;
  }

  onFinanciamentoChange() {
    // Limpar campos de financiamento quando não será financiado
    if (!this.formData.seraFinanciado) {
      this.formData.taxaJurosAnual = null as any;
      this.formData.valorEntrada = null as any;
      this.formData.prazoFinanciamentoAnos = null as any;
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
      this.formData.honorariosAdvogado = null as any;
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
    // Limpar o campo se estiver com valor 0 ou vazio
    if (event.target.value === '0' || event.target.value === '') {
      event.target.value = '';
    }
  }

  // Método para garantir que valores vazios sejam tratados como null
  onInputBlur(event: any, field: keyof ImovelData) {
    if (event.target.value === '' || event.target.value === '0') {
      (this.formData as any)[field] = null;
    }
  }
}

