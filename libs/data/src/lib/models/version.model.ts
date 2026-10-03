export interface CarVersion {
    marca: {
        id: string;
        nombre: string;
    };
    modelo: {
        id: string;
        nombre: string;
    };
    version: {
        id: string;
        nombre: string;
    };
    cilindradaCc: number;
    potenciaCv: number;
    numeroPuertas: string;
    anioLanzamiento: string;
}