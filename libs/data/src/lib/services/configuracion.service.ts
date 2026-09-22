import { inject, Injectable } from '@angular/core';
import { switchMap, tap } from 'rxjs';
import { AUTO_INSURANCE_CONSTANTS } from '@mnv-autos-clientes/shared';
import { CampoConfiguracionDto, ConfiguracionProductosDto } from '../dtos/configuracion.dto';
import { InsuranceStateService } from '../store/insurance-state.service';
import { BaseApiService, HttpOptions } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class ConfiguracionService extends BaseApiService {
	private readonly state = inject(InsuranceStateService);

	cargarInicial(): void {
		const headers = {
			lineaNegocio: AUTO_INSURANCE_CONSTANTS.lineaNegocio,
			codigoMediador: AUTO_INSURANCE_CONSTANTS.codigoMediador
		};

		this.invocarAutos<ConfiguracionProductosDto>('GET', 'configuracion/productos', { headers }).pipe(
			tap((respuesta) => {
				const productoTecnico = respuesta.productoTecnico[0];
				this.state.saveData({
					productoTecnicoConfigurado: productoTecnico,
					combinacionesComerciales: productoTecnico?.combinacionComercial ?? []
				});
			}),
			switchMap((respuesta) => {
				const combinacionComercial = respuesta.productoTecnico[0]?.combinacionComercial[0]?.codigo;
				if (!combinacionComercial) throw new Error('Productos no devuelve una combinación comercial.');
				const options: HttpOptions = {
					headers: { ...headers, combinacionComercial, precotizado: false },
					params: { tipoVehiculo: 100, codigoCompania: '0001' }
				};
				return this.invocarAutos<CampoConfiguracionDto[]>('GET', 'configuracion/campos', options);
			}),
			tap((camposConfiguracion) => this.state.saveData({ camposConfiguracion }))
		).subscribe({ error: (error) => console.error('Error cargando configuración de productos/campos:', error) });
	}
}
