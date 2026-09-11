import { CoberturaOpcional } from '../models/cobertura-opcional.model';

export const COBERTURAS_OPCIONALES_MOCK: CoberturaOpcional[] = [
	{ codigo: 'ASISTENCIA_MAS', descripcion: 'Asistencia Más (con vehículo de sustitución)', codigoRelacion: 'TERCEROS', precio: 32.5, detalle: 'Amplía tu asistencia en viaje e incluye vehículo de sustitución.' },
	{ codigo: 'AUTOHELP', descripcion: 'Autohelp', codigoRelacion: 'TERCEROS', precio: 18.75, detalle: 'Servicio de ayuda inmediata para resolver imprevistos con tu vehículo.' },
	{ codigo: 'ANIMALES', descripcion: 'Daños por colisión con animal en vía pública', codigoRelacion: 'TERCEROS', precio: 24.4, detalle: 'Protege los daños ocasionados por una colisión con animales en vía pública.' },
	{ codigo: 'PRIVACION_CARNET', descripcion: 'Privación permiso conducir mensual 360 euros máximo 1 año', codigoRelacion: 'TERCEROS', precio: 15.25, detalle: 'Si te retiran el carnet, esta cobertura te paga un subsidio mensual de hasta 360 € durante un período máximo de un año.' }
];
