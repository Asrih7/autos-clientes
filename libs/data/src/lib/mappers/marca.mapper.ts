import { ApiMarcaResponse } from '../dtos/marca.dto';
import { Marca } from '../models/marca.model';

export function mapToMarcasDomain(apiMarcas: ApiMarcaResponse[]): Marca[] {
  return apiMarcas.map(api => ({
    id: api.codigo,
    nombre: api.descripcion,
    orden: api.orden ?? 0,
    logoUrl: resolveSafeLogoPath(api.codigo)
  }));
}

const AVAILABLE_BRAND_LOGOS: Array<{ codigo: string; descripcion: string }> = [
  { codigo: '25', descripcion: 'audi' },
  { codigo: '30', descripcion: 'bmw' },
  { codigo: '33', descripcion: 'citroen' },
  { codigo: '121', descripcion: 'daf' },
  { codigo: '38', descripcion: 'fiat' },
  { codigo: '39', descripcion: 'ford' },
  { codigo: '42', descripcion: 'honda' },
  { codigo: '15', descripcion: 'hyundai' },
  { codigo: '309', descripcion: 'iveco' },
  { codigo: '266', descripcion: 'john deere' },
  { codigo: '4', descripcion: 'kawasaki' },
  { codigo: '7', descripcion: 'kia' },
  { codigo: '210', descripcion: 'ktm' },
  { codigo: '311', descripcion: 'man' },
  { codigo: '56', descripcion: 'mercedes' },
  { codigo: '271', descripcion: 'new holland' },
  { codigo: '13', descripcion: 'nissan' },
  { codigo: '59', descripcion: 'opel' },
  { codigo: '60', descripcion: 'peugeot' },
  { codigo: '230', descripcion: 'piaggio' },
  { codigo: '63', descripcion: 'renault' },
  { codigo: '68', descripcion: 'seat' },
  { codigo: '1740', descripcion: 'segway' },
  { codigo: '70', descripcion: 'skoda' },
  { codigo: '73', descripcion: 'suzuki' },
  { codigo: '14', descripcion: 'toyota' },
  { codigo: '8', descripcion: 'volkswagen' },
  { codigo: '77', descripcion: 'volvo' },
  { codigo: '246', descripcion: 'yamaha' },
];

const LOGO_CODES_ON_DISK = new Set<string>(AVAILABLE_BRAND_LOGOS.map(item => item.codigo));

function resolveSafeLogoPath(codigo: string | null | undefined): string {
  const cleanCode = (codigo || '').trim();
  
  if (LOGO_CODES_ON_DISK.has(cleanCode)) {
    return `/assets/images/marcas/${cleanCode}.png`;
  }
  
  return '/assets/images/marcas/noexiste.png';
}