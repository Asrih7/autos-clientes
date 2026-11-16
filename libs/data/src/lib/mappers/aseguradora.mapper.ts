import { ApiAseguradoraResponse } from '../dtos/aseguradora.dto';
import { Aseguradora } from '../models/aseguradora.model';

const INSURER_LOGOS: Record<string, string> = {
	allianz: 'allianz.jpg',
	axa: 'axa.png',
	'axa aurora iberica': 'axa aurora iberica.png',
	caser: 'caja de seguros reunidos - caser.jpg',
	'caser seguros': 'caja de seguros reunidos - caser.jpg',
	'caja de seguros reunidos caser': 'caja de seguros reunidos - caser.jpg',
	'catalana occidente': 'catalana occidente.jpg',
	'direct seguros hilo direct': 'Direct Seguros - Hilo Direct.jpg',
	'direct seguros axa global': 'Direct Seguros - Hilo Direct.jpg',
	'fenix directo': 'fenix directo.png',
	fenix: 'fenix.png',
	fiatc: 'fiatc.png',
	generali: 'generalli.png',
	genesis: 'genesis.png',
	groupama: 'groupama.png',
	'groupama plus ultra': 'groupama plus ultra.png',
	liberty: 'liberty.png',
	'liberty insurance group': 'liberty insurance group.png',
	'linea directa': 'linea-directa.png',
	'linea directa aseguradora': 'linea directa aseguradora.png',
	'linea directa nuez penelope': 'linea-directa.png',
	mapfre: 'mapfre.png',
	'mapfre familiar': 'Mapfre Familar.jpg',
	'mutua madrilena': 'mutua-madrilena.jpg',
	'mutua madrilena automovilista': 'mutua madrileña automovilista.jpg',
	pelayo: 'pelayo.png',
	reale: 'reale.jpg',
	segurcaixa: 'segurcaixa.jpg',
	zurich: 'zurich.jpg'
};

export function mapToAseguradorasDomain(apiAseguradoras: ApiAseguradoraResponse[]): Aseguradora[] {
	return apiAseguradoras.map((aseguradora) => ({
		id: aseguradora.codigo,
		nombre: aseguradora.descripcion,
		logoUrl: resolveSafeLogoPath(aseguradora.descripcion)
	}));
}

function resolveSafeLogoPath(descripcion: string): string {
	const normalizedDescription = normalize(descripcion);
	const fileName = INSURER_LOGOS[normalizedDescription] ?? 'noexiste.jpg';
	return `/assets/images/aseguradoras/${encodeURIComponent(fileName)}`;
}

function normalize(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-zA-Z0-9]+/g, ' ')
		.toLowerCase()
		.replace(/\b(s a u|s a|sau|sa|s l|sl|sociedad anonima|sociedad limitada)\b/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}
