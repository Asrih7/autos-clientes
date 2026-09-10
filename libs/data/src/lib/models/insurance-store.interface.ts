import { Signal } from '@angular/core';

/**
 * Global Orchestrator Contract used by Shell layout & Route Guards
 */
export interface IGlobalInsuranceStore {
  readonly isClienteComplete: Signal<boolean>;
  readonly isVehiculoComplete: Signal<boolean>;
  readonly isConductoresComplete: Signal<boolean>;
  readonly isPrimasCoberturasComplete: Signal<boolean>;
  readonly isFinalFlowComplete: Signal<boolean>;

  updateClienteAndClearDownstream(data: Partial<any>): void;
  updateVehiculoAndClearDownstream(data: Partial<any>): void;
  updateConductoresAndClearDownstream(data: Partial<any>): void;
  updatePrimasCoberturas(data: Partial<any>): void;
  updateProduccion(data: Partial<any>): void;
  clearSessionAfterPurchase(): void;
}
