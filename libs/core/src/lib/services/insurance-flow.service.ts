import { inject, Injectable, computed } from '@angular/core';
import {
	CorePersistenceStore,
	AutoInsuranceState,
	canContinueFromWizardStep,
	isDatosBancariosValidos} from '@mnv-autos-clientes/data';
import {
	WizardStep,
	isValidBirthDate,
	isValidDrivingLicenceAge} from '@mnv-autos-clientes/shared';

@Injectable({ providedIn: 'root' })
export class InsuranceFlowService {
	private readonly coreStore = inject(CorePersistenceStore);

	readonly activeStepsMap = computed<WizardStep[]>(() => {
		const snapshot = this.coreStore.globalSnapshot();
		const meta = snapshot.metadata;
		const riesgo = snapshot.historialRiesgo;
		const rolesObj = snapshot.roles;

		const steps: WizardStep[] = ['busqueda'];

		if (meta.tipoFlujo === 'MANUAL') {
			steps.push('marca', 'modelo', 'fecha-matriculacion', 'caracteristicas');
		}
		steps.push('versiones');

		if (meta.tipoFlujo === 'MANUAL') {
			steps.push('fecha-primera-matriculacion');
		}
		steps.push('fecha-nacimiento', 'anos-carnet', 'tiene-aseguradora');

		if (riesgo.tieneAseguradora) {
			steps.push('lista-aseguradoras', 'anos-asegurado', 'historial-partes');
		}
		steps.push('datos-personales', 'datos-contacto', 'precios');

		if (riesgo.tieneAseguradora) {
			steps.push('contratacion');
		}
		steps.push('coberturas-opcionales');

		if (meta.tipoFlujo === 'MANUAL') {
			steps.push('matricula');
		}
		steps.push('propietario-conductor');
		steps.push('tomador');

		if (rolesObj.esTomadorConductorPrincipal === false) {
			steps.push('conductor-vehiculo');
		}
		steps.push('segundo-conductor');

		if (rolesObj.quiereSegundoConductor === true) {
			steps.push('datos-segundo-conductor');
		}

		if (rolesObj.esTomadorPropietarioVehiculo === false) {
			steps.push('propietario-vehiculo');
		}

		steps.push('datos-bancarios', 'resumen');
		return steps;
	});

	getAccessRedirect(requestedStep: WizardStep): WizardStep | null {
		const fullSnapshot = this.coreStore.globalSnapshot();
		const activeSteps = this.activeStepsMap();
		const requestedIndex = activeSteps.indexOf(requestedStep);

		const isAtOrAfter = (step: WizardStep) => {
			const stepIndex = activeSteps.indexOf(step);
			return stepIndex !== -1 && requestedIndex >= stepIndex;
		};

		if (requestedStep === 'busqueda' || !fullSnapshot.metadata.tipoFlujo) {
			return requestedStep === 'busqueda' ? null : 'busqueda';
		}

		const meta = fullSnapshot.metadata;
		const vehiculo = fullSnapshot.vehiculo;
		const riesgo = fullSnapshot.historialRiesgo;
		const roles = fullSnapshot.roles;
		const contratacion = fullSnapshot.contratacion;

		if (meta.tipoFlujo === 'MANUAL') {
			if (isAtOrAfter('modelo') && !vehiculo.marcaSeleccionada) return 'marca';
			if (isAtOrAfter('fecha-matriculacion') && !vehiculo.modeloSeleccionado) return 'modelo';
			if (isAtOrAfter('caracteristicas') && !(vehiculo.mesPrimerMatricula && vehiculo.anioPrimerMatricula)) {
				return 'fecha-matriculacion';
			}
			if (isAtOrAfter('versiones') && !this.hasCaracteristicas(vehiculo)) return 'caracteristicas';
		}

		if (meta.tipoFlujo === 'MATRICULA' && isAtOrAfter('versiones') && !vehiculo.busqueda) {
			return 'busqueda';
		}

		if (meta.tipoFlujo === 'MANUAL' && isAtOrAfter('fecha-nacimiento') && !vehiculo.anioPrimeraMatriculacion) {
			return 'fecha-primera-matriculacion';
		}

		if (isAtOrAfter('anos-carnet') && !isValidBirthDate(fullSnapshot)) {
			return 'fecha-nacimiento';
		}

		if (isAtOrAfter('tiene-aseguradora') && !isValidDrivingLicenceAge(fullSnapshot, riesgo.edadObtencionCarnet)) {
			return 'anos-carnet';
		}

		if (isAtOrAfter('lista-aseguradoras') && riesgo.tieneAseguradora !== true) {
			return 'tiene-aseguradora';
		}

		if (isAtOrAfter('anos-asegurado') && !riesgo.aseguradoraSeleccionada) {
			return 'lista-aseguradoras';
		}

		if (isAtOrAfter('historial-partes') && !riesgo.aniosAsegurado) {
			return 'anos-asegurado';
		}

		if (riesgo.tieneAseguradora && isAtOrAfter('datos-personales') && !riesgo.numeroSiniestros) {
			return 'historial-partes';
		}

		if (isAtOrAfter('datos-contacto') && !canContinueFromWizardStep('datos-personales', fullSnapshot)) {
			return 'datos-personales';
		}

		if (isAtOrAfter('precios') && !canContinueFromWizardStep('datos-contacto', fullSnapshot)) {
			return 'datos-contacto';
		}

		if (isAtOrAfter('coberturas-opcionales') && !contratacion.modalidadSeleccionada) return 'precios';

		if (
			isAfterRelationshipStep(requestedStep) &&
			!(roles.esTomadorConductorPrincipal !== undefined && roles.esTomadorPropietarioVehiculo !== undefined)
		) {
			return 'propietario-conductor';
		}

		if (isAfterPolicyholderStep(requestedStep) && !canContinueFromWizardStep('tomador', fullSnapshot)) return 'tomador';

		if (
			isAfterVehicleDriverStep(requestedStep) &&
			roles.esTomadorConductorPrincipal === false &&
			!canContinueFromWizardStep('conductor-vehiculo', fullSnapshot)
		) {
			return 'conductor-vehiculo';
		}

		if (requestedStep === 'conductor-vehiculo' && roles.esTomadorConductorPrincipal === true) {
			return 'segundo-conductor';
		}

		if (isAfterSecondDriverStep(requestedStep) && roles.quiereSegundoConductor === undefined) {
			return 'segundo-conductor';
		}

		if (
			isAfterSecondDriverDataStep(requestedStep) &&
			roles.quiereSegundoConductor === true &&
			!canContinueFromWizardStep('datos-segundo-conductor', fullSnapshot)
		) {
			return 'datos-segundo-conductor';
		}

		if (requestedStep === 'datos-segundo-conductor' && roles.quiereSegundoConductor === false) {
			return this.getStepAfterSecondDriver(roles);
		}

		if (requestedStep === 'propietario-vehiculo' && roles.esTomadorPropietarioVehiculo === true) {
			return 'datos-bancarios';
		}

		if (
			(requestedStep === 'datos-bancarios' || requestedStep === 'resumen') &&
			roles.esTomadorPropietarioVehiculo === false &&
			!canContinueFromWizardStep('propietario-vehiculo', fullSnapshot)
		) {
			return 'propietario-vehiculo';
		}

		if (
			meta.tipoFlujo === 'MANUAL' &&
			requestedStep !== 'matricula' &&
			isAtOrAfter('matricula') &&
			!(Boolean(vehiculo.matricula?.trim()) && Boolean(vehiculo.mesPrimerMatricula && vehiculo.anioPrimerMatricula))
		) {
			return 'matricula';
		}

		if (
			isAtOrAfter('tomador') &&
			!(roles.esTomadorConductorPrincipal !== undefined && roles.esTomadorPropietarioVehiculo !== undefined)
		) {
			return 'propietario-conductor';
		}

		if (isAtOrAfter('datos-bancarios') && !canContinueFromWizardStep('tomador', fullSnapshot)) return 'tomador';

		if (requestedStep === 'resumen' && !isDatosBancariosValidos(fullSnapshot)) return 'datos-bancarios';

		if (requestedStep === 'contratacion' && !contratacion.modalidadSeleccionada) {
			return 'precios';
		}

		return null;
	}

	canContinue(step: WizardStep): boolean {
		const fullSnapshot = this.coreStore.globalSnapshot();
		const riesgo = fullSnapshot.historialRiesgo;
		const contratacion = fullSnapshot.contratacion;
		const roles = fullSnapshot.roles;

		switch (step) {
			case 'fecha-nacimiento':
				return isValidBirthDate(fullSnapshot);
			case 'anos-carnet':
				return isValidDrivingLicenceAge(fullSnapshot, riesgo.edadObtencionCarnet);
			case 'fecha-matriculacion':
			case 'fecha-primera-matriculacion':
			case 'anos-asegurado':
			case 'historial-partes':
			case 'datos-personales':
			case 'datos-contacto':
			case 'propietario-conductor':
			case 'tomador':
			case 'conductor-vehiculo':
			case 'datos-segundo-conductor':
			case 'propietario-vehiculo':
			case 'matricula':
			case 'datos-bancarios':
				return canContinueFromWizardStep(step, fullSnapshot);
			case 'tiene-aseguradora':
				return riesgo.tieneAseguradora !== undefined;
			case 'contratacion':
				return Boolean(contratacion.ultimosDigitosPoliza && contratacion.ultimosDigitosPoliza.length === 5);
			case 'segundo-conductor':
				return roles.quiereSegundoConductor !== undefined;
			default:
				return this.getAccessRedirect(step) === null;
		}
	}

	getNextStep(currentStep: WizardStep): WizardStep {
		const fullSnapshot = this.coreStore.globalSnapshot();
		const meta = fullSnapshot.metadata;
		const riesgo = fullSnapshot.historialRiesgo;
		const roles = fullSnapshot.roles;

		switch (currentStep) {
			case 'busqueda':
				return meta.tipoFlujo === 'MATRICULA' ? 'versiones' : 'marca';
			case 'marca':
				return 'modelo';
			case 'modelo':
				return 'fecha-matriculacion';
			case 'fecha-matriculacion':
				return 'caracteristicas';
			case 'caracteristicas':
				return 'versiones';
			case 'versiones':
				return meta.tipoFlujo === 'MATRICULA' ? 'fecha-nacimiento' : 'fecha-primera-matriculacion';
			case 'fecha-primera-matriculacion':
				return 'fecha-nacimiento';
			case 'fecha-nacimiento':
				return 'anos-carnet';
			case 'anos-carnet':
				return 'tiene-aseguradora';
			case 'tiene-aseguradora':
				return riesgo.tieneAseguradora
					? 'lista-aseguradoras'
					: meta.datosPersonalesActivos
						? 'datos-personales'
						: 'precios';
			case 'lista-aseguradoras':
				return 'anos-asegurado';
			case 'anos-asegurado':
				return 'historial-partes';
			case 'historial-partes':
				return 'datos-personales';
			case 'datos-personales':
				return 'datos-contacto';
			case 'datos-contacto':
				return 'precios';
			case 'precios':
				return riesgo.tieneAseguradora ? 'contratacion' : 'coberturas-opcionales';
			case 'contratacion':
				return 'coberturas-opcionales';
			case 'coberturas-opcionales':
				return meta.tipoFlujo === 'MANUAL' ? 'matricula' : 'propietario-conductor';
			case 'matricula':
				return 'propietario-conductor';
			case 'propietario-conductor':
				return 'tomador';
			case 'tomador':
				return this.getStepAfterPolicyholder(roles);
			case 'conductor-vehiculo':
				return 'segundo-conductor';
			case 'segundo-conductor':
				return this.getStepAfterSecondDriver(roles);
			case 'datos-segundo-conductor':
				return this.getStepAfterSecondDriver(roles);
			case 'propietario-vehiculo':
				return 'datos-bancarios';
			case 'datos-bancarios':
				return 'resumen';
			default:
				return currentStep;
		}
	}
	getPreviousStep(currentStep: WizardStep): WizardStep | null {
		const fullSnapshot = this.coreStore.globalSnapshot();
		const meta = fullSnapshot.metadata;
		const roles = fullSnapshot.roles;
		switch (currentStep) {
			case 'matricula':
				return 'coberturas-opcionales';
			case 'propietario-conductor':
				return meta.tipoFlujo === 'MANUAL' ? 'matricula' : 'coberturas-opcionales';
			case 'tomador':
				return 'propietario-conductor';
			case 'conductor-vehiculo':
				return this.getStepBeforePolicyholder();
			case 'segundo-conductor':
				return roles.esTomadorConductorPrincipal ? this.getStepBeforePolicyholder() : 'conductor-vehiculo';
			case 'datos-segundo-conductor':
				return 'segundo-conductor';
			case 'propietario-vehiculo':
				return roles.quiereSegundoConductor ? 'datos-segundo-conductor' : 'segundo-conductor';
			case 'datos-bancarios':
				if (!roles.esTomadorPropietarioVehiculo) return 'propietario-vehiculo';
				return roles.quiereSegundoConductor ? 'datos-segundo-conductor' : 'segundo-conductor';
			case 'resumen':
				return 'datos-bancarios';
			default:
				return null;
		}
	}
	private getStepAfterSecondDriver(roles: AutoInsuranceState['roles']): WizardStep {
		return roles.esTomadorPropietarioVehiculo ? 'datos-bancarios' : 'propietario-vehiculo';
	}
	private getStepAfterPolicyholder(roles: AutoInsuranceState['roles']): WizardStep {
		return roles.esTomadorConductorPrincipal ? 'segundo-conductor' : 'conductor-vehiculo';
	}
	private getStepBeforePolicyholder(): WizardStep {
		return 'tomador';
	}
	private hasCaracteristicas(vehiculo: AutoInsuranceState['vehiculo']): boolean {
		return Boolean(
			vehiculo.detalles?.combustible && vehiculo.detalles?.numeroPuertas && vehiculo.detalles?.numeroPlazas
		);
	}
}
function isAfterRelationshipStep(step: WizardStep): boolean {
	return [
		'tomador',
		'conductor-vehiculo',
		'segundo-conductor',
		'datos-segundo-conductor',
		'propietario-vehiculo',
		'datos-bancarios',
		'resumen'
	].includes(step);
}
function isAfterPolicyholderStep(step: WizardStep): boolean {
	return [
		'conductor-vehiculo',
		'segundo-conductor',
		'datos-segundo-conductor',
		'propietario-vehiculo',
		'datos-bancarios',
		'resumen'
	].includes(step);
}
function isAfterVehicleDriverStep(step: WizardStep): boolean {
	return [
		'segundo-conductor',
		'datos-segundo-conductor',
		'propietario-vehiculo',
		'datos-bancarios',
		'resumen'
	].includes(step);
}
function isAfterSecondDriverStep(step: WizardStep): boolean {
	return ['datos-segundo-conductor', 'propietario-vehiculo', 'datos-bancarios', 'resumen'].includes(step);
}
function isAfterSecondDriverDataStep(step: WizardStep): boolean {
	return ['propietario-vehiculo', 'datos-bancarios', 'resumen'].includes(step);
}
