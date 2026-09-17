import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Modalidad } from '../models/modalidades.model';

@Injectable({ providedIn: 'root' })
export class P17PolizaActualService {
	recalcular(modalidad: Modalidad, ultimosDigitosPoliza: string): Observable<Modalidad> {
		// Fuente temporal: sustituir por la llamada de retarificación de BO.
		console.info('Retarificación mock P17', { ultimosDigitosPoliza });
		return of({ ...modalidad });
	}
}
