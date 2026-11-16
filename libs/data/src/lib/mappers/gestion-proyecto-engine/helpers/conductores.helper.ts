import { DatosPersona, formatDate } from "@mnv-autos-clientes/shared";
import { AutoInsuranceState } from "../../../models/insurance-state.model";

export function getFechaCarne(data: AutoInsuranceState): string {
	const dia = Number(data.diaFechaNacimiento);
	const mes = Number(data.mesFechaNacimiento);
	const anio = Number(data.anioFechaNacimiento);
	const edadCarnet = data.historialRiesgo.edadObtencionCarnet;
	if (!Number.isInteger(dia) || !Number.isInteger(mes) || !Number.isInteger(anio) || edadCarnet === undefined) return '';

	const fecha = new Date(anio + edadCarnet, mes - 1, dia);
	if (fecha.getFullYear() !== anio + edadCarnet || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) return '';
	return formatDate(fecha);
}

export function tieneDatosPersonaParaTarificar(tomador: DatosPersona | undefined): boolean {
	
	return Boolean(
		tomador?.nif.trim() && tomador.nombre.trim() && tomador.primerApellido.trim() &&
		tomador.segundoApellido.trim() && tomador.sexo && tomador.fechaNacimiento.trim() &&
		tomador.fechaEmisionCarnet.trim() && tomador.direccion.trim() && tomador.numero.trim() &&
		tomador.codigoPostal?.trim()
	);
}