import { Cobertura, Modalidad } from '../models/modalidades.model';

const coberturasIncluidas: Cobertura[] = [
	{ codigo: 'RC1', descripcion: 'Responsabilidad civil de suscripción obligatoria', codigoRelacion: 'MOCK' },
	{ codigo: 'RC2', descripcion: 'Responsabilidad civil voluntaria', codigoRelacion: 'MOCK' },
	{ codigo: 'AC1', descripcion: 'Accidentes corporales', codigoRelacion: 'MOCK' },
	{ codigo: 'SPJ', descripcion: 'Seguro de protección jurídica', codigoRelacion: 'MOCK' }
];

const coberturasOpcionales: Cobertura[] = [
	{ codigo: 'ASIST', descripcion: 'Asistencia en viaje', contratada: false, codigoRelacion: 'MOCK' },
	{ codigo: 'ATM', descripcion: 'Fenómenos atmosféricos', contratada: false, codigoRelacion: 'MOCK' },
	{ codigo: 'ACC_COND', descripcion: 'Accidentes del conductor', contratada: false, codigoRelacion: 'MOCK' },
	{ codigo: 'COL_ANI', descripcion: 'Daños por colisión con animal', contratada: false, codigoRelacion: 'MOCK' }
];

const crearModalidad = (modalidad: Omit<Modalidad, 'coberturasIncluidas' | 'coberturasOpcionales'>): Modalidad => ({
	...modalidad,
	coberturasIncluidas: coberturasIncluidas.map((cobertura) => ({ ...cobertura })),
	coberturasOpcionales: coberturasOpcionales.map((cobertura) => ({ ...cobertura }))
});

export const MODALIDADES_MOCK: Modalidad[] = [
	crearModalidad({ codigo: 'TERCERO_BASICO', descripcion: 'Tercero básico', orden: '1', agrupacion: { codigo: 'TERCEROS', descripcion: 'Terceros', codigoRelacion: 'TERCEROS_BASICO' }, primaTotal: 63, primerRecibo: 63, restoRecibos: 0, franquicia: null, derogacion: false }),
	crearModalidad({ codigo: 'TERCERO_BASICO_LUNA', descripcion: 'Tercero básico + luna', orden: '2', agrupacion: { codigo: 'TERCEROS', descripcion: 'Terceros', codigoRelacion: 'TERCERO_BASICO_LUNA' }, primaTotal: 70, primerRecibo: 70, restoRecibos: 0, franquicia: null, derogacion: false }),
	crearModalidad({ codigo: 'TERCEROS_LUNAS_CXC', descripcion: 'Terceros + Lunas + CxC', orden: '3', agrupacion: { codigo: 'TERCEROS_AUMENTADO', descripcion: 'Terceros aumentado', codigoRelacion: 'TERCEROS_LUNAS_CXC' }, primaTotal: 180, primerRecibo: 180, restoRecibos: 0, franquicia: null, derogacion: false }),
	crearModalidad({ codigo: 'TERCEROS_LUNAS_ROBO', descripcion: 'Terceros + Lunas + Robo', orden: '4', agrupacion: { codigo: 'TERCEROS_AUMENTADO', descripcion: 'Terceros aumentado', codigoRelacion: 'TERCEROS_LUNAS_ROBO' }, primaTotal: 0, primerRecibo: 0, restoRecibos: 0, franquicia: null, derogacion: true }),
	crearModalidad({ codigo: 'RIESGO_300', descripcion: 'Riesgo con franquicia', orden: '5', agrupacion: { codigo: 'TODO_RIESGO', descripcion: 'A todo riesgo', codigoRelacion: 'RIESGO_300' }, primaTotal: 270, primerRecibo: 270, restoRecibos: 0, franquicia: 300, derogacion: false }),
	crearModalidad({ codigo: 'RIESGO_600', descripcion: 'Riesgo con franquicia', orden: '5', agrupacion: { codigo: 'TODO_RIESGO', descripcion: 'A todo riesgo', codigoRelacion: 'RIESGO_600' }, primaTotal: 220, primerRecibo: 220, restoRecibos: 0, franquicia: 600, derogacion: false }),
	crearModalidad({ codigo: 'RIESGO_900', descripcion: 'Riesgo con franquicia', orden: '5', agrupacion: { codigo: 'TODO_RIESGO', descripcion: 'A todo riesgo', codigoRelacion: 'RIESGO_900' }, primaTotal: 190, primerRecibo: 190, restoRecibos: 0, franquicia: 900, derogacion: false }),
	crearModalidad({ codigo: 'RIESGO_0', descripcion: 'Riesgo sin franquicia', orden: '6', agrupacion: { codigo: 'TODO_RIESGO', descripcion: 'A todo riesgo', codigoRelacion: 'RIESGO_0' }, primaTotal: 300, primerRecibo: 300, restoRecibos: 0, franquicia: 0, derogacion: false })
];
