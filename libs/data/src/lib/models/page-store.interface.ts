import { WritableSignal, Signal } from "@angular/core";

/**
 * Generic blueprint contract enforced across all individual page stores
 */
export interface IPageStore<T> {
  // The raw state containing the form data slice
  readonly state: WritableSignal<T | null>;
  // Automatically computed readiness flag for the specific page
  readonly isComplete: Signal<boolean>;
  // Updates the state data incrementally
  updateData(data: Partial<T>): void;
  // Wipes out the data slice completely
  clear(): void;
}