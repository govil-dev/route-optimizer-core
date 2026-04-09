export class CalcularRutaOptimaInput {
  readonly vehiculoId: string;
  readonly paqueteIds: string[];
  readonly puntoPartida: { latitud: number; longitud: number };
  readonly horaPartida?: Date;
}
