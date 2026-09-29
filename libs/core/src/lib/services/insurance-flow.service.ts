import { inject, Injectable } from '@angular/core';
import { InsuranceStateService } from '@mnv-autos-clientes/data';
import { WizardStep } from '@mnv-autos-clientes/shared';
@Injectable({ providedIn: 'root' })
export class InsuranceFlowService {
	private readonly insuranceState = inject(InsuranceStateService);
	getAccessRedirect(requestedStep: WizardStep): WizardStep | null {
		const data = this.insuranceState.formData();
		const activeSteps = this.insuranceState.activeStepsMap();
		const requestedIndex = activeSteps.indexOf(requestedStep);
		const isAtOrAfter = (step: WizardStep) => {
			const stepIndex = activeSteps.indexOf(step);
			return stepIndex !== -1 && requestedIndex >= stepIndex;
		};
		if (requestedStep === 'busqueda' || !data.tipoFlujo) {
			return requestedStep === 'busqueda' ? null : 'busqueda';
		}
		if (data.tipoFlujo === 'MANUAL') {
			if (isAtOrAfter('modelo') && !data.marcaSeleccionada) return 'marca';
			if (isAtOrAfter('fecha-matriculacion') && !data.modeloSeleccionado) return 'modelo';
			if (isAtOrAfter('versiones') && !this.hasCaracteristicas()) return 'caracteristicas';
		}
		if (data.tipoFlujo === 'MATRICULA' && isAtOrAfter('versiones') && !data.vehiculo) {
			return 'busqueda';
		}
		if (data.tipoFlujo === 'MANUAL' && isAtOrAfter('fecha-nacimiento') && !data.anioPrimeraMatriculacion) {
			return 'fecha-primera-matriculacion';
		}
		if (isAtOrAfter('anos-carnet') && !this.insuranceState.isFechaNacimientoValida()) {
			return 'fecha-nacimiento';
		}
		if (isAtOrAfter('tiene-aseguradora') && !this.insuranceState.isEdadObtencionCarnetValida()) {
			return 'anos-carnet';
		}
		if (isAtOrAfter('lista-aseguradoras') && data.tieneAseguradora !== true) {
			return 'tiene-aseguradora';
		}
		if (isAtOrAfter('anos-asegurado') && !data.aseguradoraSeleccionada) {
			return 'lista-aseguradoras';
		}
		if (isAtOrAfter('historial-partes') && !data.aniosAsegurado) {
			return 'anos-asegurado';
		}
		if (data.tieneAseguradora && isAtOrAfter('datos-personales') && !data.numeroSiniestros) {
			return 'historial-partes';
		}
		if (isAtOrAfter('datos-contacto') && !this.insuranceState.isDatosPersonalesValidos()) {
			return 'datos-personales';
		}
		if (isAtOrAfter('precios') && !this.insuranceState.isDatosContactoValidos()) {
			return 'datos-contacto';
		}
		if (isAfterRelationshipStep(requestedStep) && !this.insuranceState.isRelacionTomadorConductorPropietarioValida()) {
			return 'propietario-conductor';
		}
		if (isAfterPolicyholderStep(requestedStep) && !this.insuranceState.isDatosTomadorValido()) return 'tomador';
		if (
			isAfterVehicleDriverStep(requestedStep) &&
			data.esTomadorConductorPrincipal === false &&
			!this.insuranceState.isDatosPersonaRolValido('conductorVehiculo')
		) {
			return 'conductor-vehiculo';
		}
		if (requestedStep === 'conductor-vehiculo' && data.esTomadorConductorPrincipal === true) {
			return 'segundo-conductor';
		}
		if (isAfterSecondDriverStep(requestedStep) && data.quiereSegundoConductor === undefined) {
			return 'segundo-conductor';
		}
		if (
			isAfterSecondDriverDataStep(requestedStep) &&
			data.quiereSegundoConductor === true &&
			!this.insuranceState.isDatosPersonaRolValido('segundoConductor')
		) {
			return 'datos-segundo-conductor';
		}
		if (requestedStep === 'datos-segundo-conductor' && data.quiereSegundoConductor === false) {
			return this.getStepAfterSecondDriver();
		}
		if (requestedStep === 'propietario-vehiculo' && data.esTomadorPropietarioVehiculo === true) {
			return 'datos-bancarios';
		}
		if (
			requestedStep === 'datos-bancarios' &&
			data.esTomadorPropietarioVehiculo === false &&
			!this.insuranceState.isDatosPersonaRolValido('propietario')
		)
			return 'propietario-vehiculo';
		if (
			data.tipoFlujo === 'MANUAL' &&
			requestedStep !== 'matricula' &&
			isAtOrAfter('matricula') &&
			!this.insuranceState.isMatriculaYFechaMatriculacionValidas()
		) {
			return 'matricula';
		}
		if (isAtOrAfter('tomador') && !this.insuranceState.isRelacionTomadorConductorPropietarioValida()) {
			return 'propietario-conductor';
		}
		if (isAtOrAfter('datos-bancarios') && !this.insuranceState.isDatosTomadorValido()) return 'tomador';
		if (requestedStep === 'contratacion' && !data.modalidadSeleccionada) {
			return 'precios';
		}
		return null;
	}
	canContinue(step: WizardStep): boolean {
		const data = this.insuranceState.formData();
		switch (step) {
			case 'fecha-nacimiento':
				return this.insuranceState.isFechaNacimientoValida();
			case 'anos-carnet':
				return this.insuranceState.isEdadObtencionCarnetValida();
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
				return this.insuranceState.canContinueFromStep(step);
			case 'tiene-aseguradora':
				return data.tieneAseguradora !== undefined;
			case 'contratacion':
				return Boolean(data.ultimosDigitosPoliza && data.ultimosDigitosPoliza.length === 5);
			case 'segundo-conductor':
				return data.quiereSegundoConductor !== undefined;
			default:
				return this.getAccessRedirect(step) === null;
		}
	}
	getNextStep(currentStep: WizardStep): WizardStep {
		const data = this.insuranceState.formData();
		switch (currentStep) {
			case 'busqueda':
				return data.tipoFlujo === 'MATRICULA' ? 'versiones' : 'marca';
			case 'marca':
				return 'modelo';
			case 'modelo':
				return 'fecha-matriculacion';
			case 'fecha-matriculacion':
				return 'caracteristicas';
			case 'caracteristicas':
				return 'versiones';
			case 'versiones':
				return data.tipoFlujo === 'MATRICULA'
					? 'fecha-nacimiento'
					: 'fecha-primera-matriculacion';
			case 'fecha-primera-matriculacion':
				return 'fecha-nacimiento';
			case 'fecha-nacimiento':
				return 'anos-carnet';
			case 'anos-carnet':
				return 'tiene-aseguradora';
			case 'tiene-aseguradora':
				return data.tieneAseguradora
					? 'lista-aseguradoras'
					: data.datosPersonalesActivos
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
				return data.tieneAseguradora
					? 'contratacion'
					: 'coberturas-opcionales';
			case 'contratacion':
				return 'coberturas-opcionales';
			case 'coberturas-opcionales':
				return data.tipoFlujo === 'MANUAL'
					? 'matricula'
					: 'propietario-conductor';
			case 'matricula':
				return 'propietario-conductor';
			case 'propietario-conductor':
				return 'tomador';
			case 'tomador':
				return this.getStepAfterPolicyholder();
			case 'conductor-vehiculo':
				return 'segundo-conductor';
			case 'segundo-conductor':
				return this.getStepAfterSecondDriver();
			case 'datos-segundo-conductor':
				return this.getStepAfterSecondDriver();
			case 'propietario-vehiculo':
				return 'datos-bancarios';
			default:
				return currentStep;
		}
	}

	getPreviousStep(currentStep: WizardStep): WizardStep | null {
		const data = this.insuranceState.formData();
		switch (currentStep) {
			case 'matricula':
				return 'coberturas-opcionales';
			case 'propietario-conductor':
				return data.tipoFlujo === 'MANUAL' ? 'matricula' : 'coberturas-opcionales';
			case 'tomador':
				return 'propietario-conductor';
			case 'conductor-vehiculo':
				return this.getStepBeforePolicyholder();
			case 'segundo-conductor':
				return data.esTomadorConductorPrincipal ? this.getStepBeforePolicyholder() : 'conductor-vehiculo';
			case 'datos-segundo-conductor':
				return 'segundo-conductor';
			case 'propietario-vehiculo':
				return data.quiereSegundoConductor ? 'datos-segundo-conductor' : 'segundo-conductor';
			case 'datos-bancarios':
				if (!data.esTomadorPropietarioVehiculo) return 'propietario-vehiculo';
				return data.quiereSegundoConductor ? 'datos-segundo-conductor' : 'segundo-conductor';
			default:
				return null;
		}
	}

	private getStepAfterSecondDriver(): WizardStep {
		return this.insuranceState.formData().esTomadorPropietarioVehiculo ? 'datos-bancarios' : 'propietario-vehiculo';
	}
	private getStepAfterPolicyholder(): WizardStep {
		return this.insuranceState.formData().esTomadorConductorPrincipal ? 'segundo-conductor' : 'conductor-vehiculo';
	}
	private getStepBeforePolicyholder(): WizardStep {
		return 'tomador';
	}
	private hasCaracteristicas(): boolean {
		const data = this.insuranceState.formData();
		return Boolean(data.combustible && data.numeroPuertas && data.numeroPlazas);
	}
}

function isAfterRelationshipStep(step: WizardStep): boolean {
	return [
		'tomador',
		'conductor-vehiculo',
		'segundo-conductor',
		'datos-segundo-conductor',
		'propietario-vehiculo',
		'datos-bancarios'
	].includes(step);
}

function isAfterPolicyholderStep(step: WizardStep): boolean {
	return [
		'conductor-vehiculo',
		'segundo-conductor',
		'datos-segundo-conductor',
		'propietario-vehiculo',
		'datos-bancarios'
	].includes(step);
}

function isAfterVehicleDriverStep(step: WizardStep): boolean {
	return ['segundo-conductor', 'datos-segundo-conductor', 'propietario-vehiculo', 'datos-bancarios'].includes(step);
}

function isAfterSecondDriverStep(step: WizardStep): boolean {
	return ['datos-segundo-conductor', 'propietario-vehiculo', 'datos-bancarios'].includes(step);
}

function isAfterSecondDriverDataStep(step: WizardStep): boolean {
	return ['propietario-vehiculo', 'datos-bancarios'].includes(step);
}
