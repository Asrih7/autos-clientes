import { Injectable, signal, computed, Signal, WritableSignal } from '@angular/core';
import { IPageStore } from '../models/page-store.interface';

@Injectable({ providedIn: 'root' })
export class VehiculosStore implements IPageStore<any> {
  public readonly state: WritableSignal<any | null> = signal<any | null>(null);

  public readonly isComplete: Signal<boolean> = computed(() => {
    const data = this.state();
    if (!data) return false;
    return !!(data.matricula || (data.marcaId && data.modeloId)) && data.accesorios !== undefined;
  });

  public updateData(updated: Partial<any>): void {
    this.state.update(current => ({
      ...current || { matricula: null, marcaId: null, modeloId: null, accesorios: [] },
      ...updated
    }));
  }

  public clear(): void {
    this.state.set(null);
  }
}
