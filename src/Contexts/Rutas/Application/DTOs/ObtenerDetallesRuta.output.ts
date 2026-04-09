interface ParadaOutput {
    direccion: string;
    latitud: number;
    longitud: number;
    paqueteId?: string;
    tiempoEstimadoLlegada?: Date;
    tiempoEstimadoSalida?: Date;
}

interface VehiculoOutput {
    vehiculoId: string;
    placa: string;
    capacidad: number;
}

export interface ObtenerDetallesRutaOutput {
    rutaId: string;
    estado: string;
    origen: {
        latitud: number;
        longitud: number;
    };
    destino: {
        latitud: number;
        longitud: number;
    };
    paradas: ParadaOutput[];
    vehiculoAsignado?: VehiculoOutput;
    distanciaTotalKm: number;
    duracionEstimadaMin: number;
    fechaCreacion: Date;
}
