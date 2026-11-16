import { Cobertura, Modalidad } from '../models/modalidades.model';

const coberturasTercerosBase: Cobertura[] = [
	{ codigo: 'RC_OBLIGATORIA', descripcion: 'Responsabilidad civil de suscripción obligatoria', codigoRelacion: 'TERCEROS' },
	{ codigo: 'RC_VOLUNTARIA', descripcion: 'Responsabilidad civil voluntaria', codigoRelacion: 'TERCEROS' },
	{ codigo: 'ACCIDENTES', descripcion: 'Accidentes corporales', codigoRelacion: 'TERCEROS' },
	{ codigo: 'PROTECCION_JURIDICA', descripcion: 'Seguro de protección jurídica', codigoRelacion: 'TERCEROS' },
	{ codigo: 'ASISTENCIA', descripcion: 'Asistencia en viaje', codigoRelacion: 'TERCEROS' },
	{ codigo: 'AVERIA', descripcion: 'Avería mecánica inmovilizadora', codigoRelacion: 'TERCEROS' }
];

const coberturasTodoRiesgo: Cobertura[] = [
	...coberturasTercerosBase.slice(0, 2),
	{ codigo: 'DANOS', descripcion: 'Daños del vehículo con franquicia', codigoRelacion: 'TODO_RIESGO' },
	{ codigo: 'ROBO', descripcion: 'Robo del vehículo', codigoRelacion: 'TODO_RIESGO' },
	{ codigo: 'LUNAS', descripcion: 'Rotura de lunas del vehículo', codigoRelacion: 'TODO_RIESGO' },
	...coberturasTercerosBase.slice(2)
];

const crearModalidad = (
	codigo: string,
	descripcion: string,
	orden: string,
	agrupacion: Modalidad['agrupacion'],
	primaTotal: number,
	coberturasIncluidas: Cobertura[],
	franquicia: number | null = null
): Modalidad => ({
	codigo,
	descripcion,
	orden,
	agrupacion,
	primaTotal,
	primerRecibo: primaTotal,
	restoRecibos: 0,
	franquicia,
	coberturasIncluidas: coberturasIncluidas.map((cobertura) => ({ ...cobertura })),
	coberturasOpcionales: [],
	derogacion: false
});

const terceros = {
	codigo: 'TERCEROS',
	descripcion: 'Terceros',
	codigoRelacion: 'TERCEROS_BASICO'
};

const todoRiesgo = {
	codigo: 'TODO_RIESGO',
	descripcion: 'Todo Riesgo',
	codigoRelacion: 'TODO_RIESGO_900'
};

export const MODALIDADES_MOCK: Modalidad[] = [
	crearModalidad('TERCEROS_BASE', 'Terceros', '1', terceros, 413.73, coberturasTercerosBase),
	crearModalidad(
		'TERCEROS_LUNAS',
		'Lunas',
		'2',
		terceros,
		439.42,
		[...coberturasTercerosBase, { codigo: 'LUNAS', descripcion: 'Rotura de lunas del vehículo', codigoRelacion: 'TERCEROS' }]
	),
	crearModalidad(
		'TERCEROS_LUNAS_INCENDIO',
		'Lunas + Incendio',
		'3',
		terceros,
		462.18,
		[
			...coberturasTercerosBase,
			{ codigo: 'LUNAS', descripcion: 'Rotura de lunas del vehículo', codigoRelacion: 'TERCEROS' },
			{ codigo: 'INCENDIO', descripcion: 'Incendio del vehículo exclusivamente', codigoRelacion: 'TERCEROS' }
		]
	),
	crearModalidad(
		'TERCEROS_LUNAS_INCENDIO_CXC',
		'Lunas + Incendio + Coche x Coche',
		'4',
		terceros,
		493.91,
		[
			...coberturasTercerosBase,
			{ codigo: 'LUNAS', descripcion: 'Rotura de lunas del vehículo', codigoRelacion: 'TERCEROS' },
			{ codigo: 'INCENDIO', descripcion: 'Incendio del vehículo exclusivamente', codigoRelacion: 'TERCEROS' },
			{ codigo: 'CXC', descripcion: 'Daños por coche contra coche', codigoRelacion: 'TERCEROS' }
		]
	),
	crearModalidad('TODO_RIESGO_900', 'Todo Riesgo con franquicia', '1', todoRiesgo, 721.82, coberturasTodoRiesgo, 900),
	crearModalidad('TODO_RIESGO_600', 'Todo Riesgo con franquicia', '2', todoRiesgo, 756.24, coberturasTodoRiesgo, 600),
	crearModalidad('TODO_RIESGO_300', 'Todo Riesgo con franquicia', '3', todoRiesgo, 794.58, coberturasTodoRiesgo, 300),
	crearModalidad('TODO_RIESGO_0', 'Todo Riesgo sin franquicia', '4', todoRiesgo, 849.96, coberturasTodoRiesgo, 0)
];
