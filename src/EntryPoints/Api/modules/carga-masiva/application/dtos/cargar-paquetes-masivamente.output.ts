export interface CargarPaquetesMasivamenteOutput {
    rutaId: string | null;
    vehiculoId: string | null;
    paradas: Array<{
        paqueteId: string;
        ubicacion: {
            latitud: number;
            longitud: number;
            direccion?: string;
        };
        tipo: "RECOGIDA" | "ENTREGA";
        horaLlegadaEstimada: Date;
        horaSalidaEstimada: Date;
    }>;
    paquetesAsignados: string[];
    paquetesNoAsignados: string[];
    paquetesConErroresDeParsing: { id: string; error: string }[];
    distanciaTotal: number;
    duracionEstimada: number;
}
