import { Injectable, inject, computed } from '@angular/core';
import { CorePersistenceStore } from './core-persistence.store';
import * as Reducers from './reducers/roles.reducers';
import { DatosPersona } from '@mnv-autos-clientes/shared';
import * as Utils from '../insurance-state.utils';
import { DatosPersonaRol } from '../../models/insurance-state.model';

@Injectable({ providedIn: 'root' })
export class RolesStore {
	private readonly coreStore = inject(CorePersistenceStore);

	readonly state = computed(() => this.coreStore.globalSnapshot().roles);
	readonly tomadorProfile = computed(() => Utils.assembleDatosTomador(this.coreStore.globalSnapshot()));
	readonly conductorPrincipalProfile = computed(() =>
		Utils.assembleDatosConductorPrincipal(this.coreStore.globalSnapshot())
	);
	readonly propietarioVehiculoProfile = computed(() =>
		Utils.assembleDatosPropietarioVehiculo(this.coreStore.globalSnapshot())
	);

	guardarTomadorConductorPrincipal(esPrincipal: boolean): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			roles: Reducers.registrarTomadorConductorPrincipal(state.roles, esPrincipal)
		}));
	}

	guardarTomadorPropietarioVehiculo(esPropietario: boolean): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			roles: Reducers.registrarTomadorPropietarioVehiculo(state.roles, esPropietario)
		}));
	}

	guardarDatosPersonaRol(rol: DatosPersonaRol, datosPersona: DatosPersona): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			roles: Reducers.registrarDatosPersonaRol(state.roles, rol, datosPersona)
		}));
	}

	guardarQuiereSegundoConductor(quiereSegundoConductor: boolean): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			roles: Reducers.registrarQuiereSegundoConductor(state.roles, quiereSegundoConductor)
		}));
	}
}
