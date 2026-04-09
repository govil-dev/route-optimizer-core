interface ParadaDto {
  paqueteId: string;
  direccion: string;
  horaEstimadaLlegada: Date;
  horaEstimadaSalida: Date;
}

export class CalcularRutaOptimaOutput {
  readonly rutaId: string;
  readonly paradas: ParadaDto[];
  readonly distanciaTotal: number; // en metros
  readonly duracionTotal: number; // en segundos
}
