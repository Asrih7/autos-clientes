import { Cobertura } from './modalidades.model';

export interface CoberturaOpcional extends Cobertura {
	precio: number;
	detalle: string;
}
