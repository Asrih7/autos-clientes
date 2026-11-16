import { ApiMarcaResponse } from '../dtos/marca.dto';
import { Marca } from '../models/marca.model';

export function mapToMarcasDomain(apiMarcas: ApiMarcaResponse[]): Marca[] {
  return apiMarcas.map(api => ({
    id: api.codigo,
    nombre: api.descripcion,
    orden: api.orden ?? 0,
    logoUrl: resolveSafeLogoPath(api.descripcion)
  }));
}

const AVAILABLE_BRAND_LOGOS: Array<{ codigo: string; descripcion: string }> = [
  { codigo: '11', descripcion: 'AUDI' },
  { codigo: '16', descripcion: 'BMW' },
  { codigo: '20', descripcion: 'CITROEN' },
  { codigo: '113', descripcion: 'DAF' },
  { codigo: '25', descripcion: 'FIAT' },
  { codigo: '26', descripcion: 'FORD' },
  { codigo: '29', descripcion: 'HONDA' },
  { codigo: '30', descripcion: 'HYUNDAI' },
  { codigo: '306', descripcion: 'IVECO' },
  { codigo: '262', descripcion: 'JOHN DEERE' },
  { codigo: '205', descripcion: 'KAWASAKI' },
  { codigo: '75', descripcion: 'KIA' },
  { codigo: '206', descripcion: 'KTM' },
  { codigo: '308', descripcion: 'MAN' },
  { codigo: '44', descripcion: 'MERCEDES' },
  { codigo: '268', descripcion: 'NEW HOLLAND' },
  { codigo: '47', descripcion: 'NISSAN' },
  { codigo: '48', descripcion: 'OPEL' },
  { codigo: '49', descripcion: 'PEUGEOT' },
  { codigo: '226', descripcion: 'PIAGGIO' },
  { codigo: '52', descripcion: 'RENAULT' },
  { codigo: '57', descripcion: 'SEAT' },
  { codigo: '1739', descripcion: 'SEGWAY' },
  { codigo: '59', descripcion: 'SKODA' },
  { codigo: '62', descripcion: 'SUZUKI' },
  { codigo: '64', descripcion: 'TOYOTA' },
  { codigo: '67', descripcion: 'VOLKSWAGEN' },
  { codigo: '68', descripcion: 'VOLVO' },
  { codigo: '242', descripcion: 'YAMAHA' },
];

const LOGO_DESCRIPTIONS_ON_DISK = new Set<string>(AVAILABLE_BRAND_LOGOS.map(item => item.descripcion));

function resolveSafeLogoPath(descripcion: string): string {
  // const cleanCode = (descripcion || '').trim();
  
  if (LOGO_DESCRIPTIONS_ON_DISK.has(descripcion)) {
    return `/assets/images/marcas/${descripcion}.png`;
  }
  
  return '/assets/images/marcas/NOEXISTE.png';
}