
// Esta es solo la definición de la interfaz para el caso de uso.

export interface ActualizarUbicacionVehiculoUseCase {
  execute(input: ActualizarUbicacionVehiculoInput): Promise<void>;
}

export interface ActualizarUbicacionVehiculoInput {
  vehiculoId: string;
  latitud: number;
  longitud: number;
  timestamp: Date;
}
