import { CargarPaquetesMasivamenteOutput } from "./cargar-paquetes-masivamente.output";

export interface PackageDataDto {
    packageId: string;
    address: string;
    lat: number;
    lng: number;
    weightKg: number;
    timeWindow: string;
    priority: string;
}

export interface CargarPaquetesMasivamenteInput {
    fileContent: string;
}
