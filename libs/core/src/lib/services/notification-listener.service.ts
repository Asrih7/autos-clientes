import { effect, inject, Injectable } from '@angular/core';
import { BalToastService } from '@baloise/ds-angular';
import { NotificationBusService, NotificationPayload } from '@mnv-autos-clientes/shared';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
	providedIn: 'root'
})
export class NotificationListenerService {
	// Inyecciones de dependencias Core y de Terceros
	private readonly notificationBus = inject(NotificationBusService);
	private readonly baloiseToastController = inject(BalToastService);
	private readonly translocoService = inject(TranslocoService);

	constructor() {
		/**
		 * Hilo de escucha reactivo (Background Worker). 
		 * Reacciona de forma automática cada vez que `.incomingNotification$` emite un nuevo payload.
		 */
		effect(() => {
			const activeEvent = this.notificationBus.incomingNotification$();
			
			// Si no hay evento activo en el bus, detenemos la ejecución del ciclo actual
			if (!activeEvent) return;

			// 1. Resolvemos el texto final (Traducido o Literal)
			const resolvedMessageText = this.resolveMessageText(activeEvent);

			// 2. Disparamos la interfaz gráfica de Baloise Toast
			this.renderBaloiseToast(resolvedMessageText, activeEvent);
		});
	}

	/**
	 * Evalúa si el payload contiene una clave o un texto plano y extrae el string final.
	 */
	private resolveMessageText(event: NotificationPayload): string {
		return event.isTranslationKey
			? this.translocoService.translate(event.messageOrTranslationKey)
			: event.messageOrTranslationKey;
	}

	/**
	 * Configura y ejecuta la creación del Toast en la interfaz de usuario basándose 
	 * en la severidad y los requerimientos visuales definidos por Baloise.
	 */
	private renderBaloiseToast(messageText: string, event: NotificationPayload): void {
		const defaultSuccessInfoDuration = 4000;

		switch (event.severity) {
			case 'success':
				this.baloiseToastController.create({
					message: messageText,
					color: 'success',
					duration: event.displayDurationMs ?? defaultSuccessInfoDuration
				});
				break;

			case 'info':
				this.baloiseToastController.create({
					message: messageText,
					color: 'info',
					duration: event.displayDurationMs ?? defaultSuccessInfoDuration
				});
				break;

			case 'warning':
				this.baloiseToastController.create({
					message: messageText,
					color: 'warning',
					closable: true // Advertencias requieren que el usuario las cierre manualmente
				});
				break;

			case 'error':
				this.baloiseToastController.create({
					message: messageText,
					color: 'danger', // Mapeo de severidad 'error' al color corporativo 'danger'
					closable: true   // Errores críticos requieren confirmación visual (cierre manual)
				});
				break;
		}
	}
}
