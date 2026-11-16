export interface ProductoTecnicoConfiguracionDto {
	codigo: string;
	descripcion: string;
	combinacionComercial: CombinacionComercialDto[];
}

export interface CombinacionComercialDto {
	productoTecnico: string;
	codigo: string;
	descripcion: string;
	permitePrecotizados: boolean;
}

export interface ConfiguracionProductosDto {
	urlAyuda: string;
	segmento: unknown[];
	productoTecnico: ProductoTecnicoConfiguracionDto[];
}

export interface CampoConfiguracionDto {
	idCampo: string;
	descripcion: string;
	editable: boolean;
	obligatorio: boolean;
	valorPorDefecto: string;
	visible: boolean;
	valoresPosibles?: Array<{ clave: string; valor: string }>;
}
