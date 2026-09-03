import { inject, Injectable } from '@angular/core';
import { AutoInsuranceDriverStateService, InsuranceStateService } from '@mnv-autos-clientes/data';
import { WizardStep } from '@mnv-autos-clientes/shared';

@Injectable({ providedIn: 'root' })
export class InsuranceFlowService {
	private readonly insuranceState = inject(InsuranceStateService);
	private readonly driverState = inject(AutoInsuranceDriverStateService);

	getAccessRedirect(requestedStep: WizardStep): WizardStep | null {
		const data = this.insuranceState.formData();
		const activeSteps = this.insuranceState.activeStepsMap();
		const requestedIndex = activeSteps.indexOf(requestedStep);
		const isAtOrAfter = (step: WizardStep) => {
			const stepIndex = activeSteps.indexOf(step);
			return stepIndex !== -1 && requestedIndex >= stepIndex;
		};

		if (requestedStep === 'busqueda' || !data.tipoFlujo) return requestedStep === 'busqueda' ? null : 'busqueda';

		if (data.tipoFlujo === 'MANUAL') {
			if (isAtOrAfter('modelo') && !data.marcaSeleccionada) return 'marca';
			if (isAtOrAfter('fecha-matriculacion') && !data.modeloSeleccionado) return 'modelo';
			if (isAtOrAfter('versiones') && !this.hasCaracteristicas()) return 'caracteristicas';
		}

		if (data.tipoFlujo === 'MATRICULA' && isAtOrAfter('versiones') && !data.vehiculo) return 'busqueda';
		if (isAtOrAfter('anos-carnet') && !this.driverState.isFechaNacimientoValida()) return 'fecha-nacimiento';
		if (isAtOrAfter('tiene-aseguradora') && !this.driverState.isEdadObtencionCarnetValida()) return 'anos-carnet';
		if (isAtOrAfter('lista-aseguradoras') && data.tieneAseguradora !== true) return 'tiene-aseguradora';
		if (isAtOrAfter('anos-asegurado') && !data.aseguradoraSeleccionada) return 'lista-aseguradoras';

		return null;
	}

	canContinue(step: WizardStep): boolean {
		const data = this.insuranceState.formData();

		switch (step) {
			case 'fecha-nacimiento':
				return this.driverState.isFechaNacimientoValida();
			case 'anos-carnet':
				return this.driverState.isEdadObtencionCarnetValida();
			case 'tiene-aseguradora':
				return data.tieneAseguradora !== undefined;
			default:
				return this.getAccessRedirect(step) === null;
		}
	}

	getNextStep(currentStep: WizardStep): WizardStep {
		const data = this.insuranceState.formData();
		const driverData = this.driverState.formData();

		switch (currentStep) {
			case 'busqueda': return data.tipoFlujo === 'MATRICULA' ? 'versiones' : 'marca';
			case 'marca': return 'modelo';
			case 'modelo': return 'fecha-matriculacion';
			case 'fecha-matriculacion': return 'caracteristicas';
			case 'caracteristicas': return 'versiones';
			case 'versiones': return data.tipoFlujo === 'MATRICULA' ? 'fecha-nacimiento' : 'fecha-primera-matriculacion';
			case 'fecha-primera-matriculacion': return 'fecha-nacimiento';
			case 'fecha-nacimiento': return 'anos-carnet';
			case 'anos-carnet': return 'tiene-aseguradora';
			case 'tiene-aseguradora':
				return data.tieneAseguradora ? 'lista-aseguradoras' : driverData.datosPersonalesActivos ? 'datos-personales' : 'precios';
			case 'lista-aseguradoras': return 'anos-asegurado';
			case 'anos-asegurado': return 'historial-partes';
			case 'historial-partes': return 'datos-personales';
			case 'datos-personales': return 'datos-contacto';
			case 'datos-contacto': return 'precios';
			default: return currentStep;
		}
	}

	private hasCaracteristicas(): boolean {
		const data = this.insuranceState.formData();
		return Boolean(data.combustible && data.numeroPuertas && data.numeroPlazas);
	}
}
