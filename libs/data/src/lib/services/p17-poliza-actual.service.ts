import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Modalidad } from '../models/modalidades.model';
import { CotizacionService } from './cotizacion.service';

@Injectable({ providedIn: 'root' })
export class P17PolizaActualService {
	private readonly cotizacionService = inject(CotizacionService);
	recalcular(modalidad: Modalidad, ultimosDigitosPoliza: string): Observable<Modalidad> {
		// Fuente temporal: sustituir por la llamada de retarificación de BO.
		console.info('Retarificación mock P17', { ultimosDigitosPoliza });
		return this.cotizacionService.cotizar().pipe(map((respuesta) => {
			const escenario = respuesta.escenarios.find((item) => item.codigo === modalidad.codigo);
			return escenario ? { ...modalidad, primaTotal: escenario.primaTotal, primerRecibo: escenario.primerRecibo, restoRecibos: escenario.restoRecibos, coberturasIncluidas: escenario.coberturasObligatorias, coberturasOpcionales: escenario.coberturasOpcionales } : modalidad;
		}));
	}
}
