import { Injectable, signal } from '@angular/core';

// Tipos permitidos para las alertas basados en el Diseño del Sistema de Baloise
export type NotificationSeverity  = 'success' | 'error' | 'warning' | 'info';

export interface NotificationPayload {
	/** ID único basado en timestamp para obligar a Angular a detectar cambios incluso en mensajes idénticos consecutivos */
	uniqueEventId: number;
	/** Puede ser texto plano en español o una ruta de clave de Transloco (Ej: 'tarificacion.step1.error_messages.404_not_found') */
	messageOrTranslationKey: string;
	/** Severidad del Toast que determina el color y comportamiento visual de Baloise */
	severity: NotificationSeverity;
	/** Tiempo de vida del Toast en milisegundos (Opcional) */
	displayDurationMs?: number;
	/** Flag crucial: Indica al listener si debe procesar el texto a través del motor de Transloco antes de mostrarlo */
	isTranslationKey: boolean;
}

@Injectable({
	providedIn: 'root'
})
export class NotificationBusService {
	// Guardamos el payload del evento actual. Es privado para evitar mutaciones externas directas.
	private readonly _transientNotificationEvent = signal<NotificationPayload | null>(null);
	
	// Exposición pública de solo lectura para que la capa Core escuche los cambios
	readonly incomingNotification$ = this._transientNotificationEvent.asReadonly();

	/**
	 * Emite una petición de notificación/toast que cruzará las fronteras de librerías Nx.
	 * 
	 * @param textOrKey El texto literal o la clave de Transloco.
	 * @param severity El tipo de alerta ('error', 'success', 'warning', 'info'). Por defecto es 'error'.
	 * @param durationMs Duración opcional de pantalla en milisegundos.
	 * @param isKey Marcar como 'true' si estás enviando una clave de traducción de es.json. Por defecto es 'false'.
	 */
	emit(
		textOrKey: string, 
		severity: NotificationSeverity = 'error', 
		durationMs?: number, 
		isKey = false
	): void {
		// Publicamos el nuevo objeto. El uso de Date.now() garantiza que el valor del Signal sea 
		// SIEMPRE diferente, permitiendo lanzar múltiples toasts seguidos con el mismo texto.
		this._transientNotificationEvent.set({
			uniqueEventId: Date.now(),
			messageOrTranslationKey: textOrKey,
			severity: severity,
			displayDurationMs: durationMs,
			isTranslationKey: isKey
		});
	}
}
