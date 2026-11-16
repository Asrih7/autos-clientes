import { inject, Injectable } from '@angular/core';
import { switchMap, tap } from 'rxjs';
import { AUTO_INSURANCE_CONSTANTS } from '@mnv-autos-clientes/shared';
import { CampoConfiguracionDto, ConfiguracionProductosDto } from '../dtos/configuracion.dto';
import { CorePersistenceStore } from '../store/+state/core-persistence.store';
import { BaseApiService, HttpOptions } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class ConfiguracionService extends BaseApiService {
	private readonly coreStore = inject(CorePersistenceStore);

	cargarInicial(): void {
		const headers = {
			lineaNegocio: AUTO_INSURANCE_CONSTANTS.lineaNegocio,
			codigoMediador: AUTO_INSURANCE_CONSTANTS.codigoMediador
		};

		this.invocarAutos<ConfiguracionProductosDto>('GET', 'configuracion/productos', { headers })
			.pipe(
				tap((respuesta) => {
					const productoTecnico = respuesta.productoTecnico[0];

					this.coreStore.updateGlobalSlice((state) => ({
						...state,
						configuracion: {
							...state.configuracion,
							productoTecnicoConfigurado: productoTecnico ?? state.configuracion.productoTecnicoConfigurado,
							combinacionesComerciales: productoTecnico?.combinacionComercial ?? state.configuracion.combinacionesComerciales
						}
					}));
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
				tap((camposConfiguracion) => {
					this.coreStore.updateGlobalSlice((state) => ({
						...state,
						configuracion: {
							...state.configuracion,
							camposConfiguracion: camposConfiguracion ?? state.configuracion.camposConfiguracion
						}
					}));
				})
			)
			.subscribe({ error: (error) => console.error('Error cargando configuración de productos/campos:', error) });
	}
}
