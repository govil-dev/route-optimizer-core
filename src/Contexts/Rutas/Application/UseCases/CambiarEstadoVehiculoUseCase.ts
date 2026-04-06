
// Esta es solo la definición de la interfaz para el caso de uso.

export interface CambiarEstadoVehiculoUseCase {
  execute(input: CambiarEstadoVehiculoInput): Promise<void>;
}

export interface CambiarEstadoVehiculoInput {
  vehiculoId: string;
  nuevoEstado: "DISPONIBLE" | "EN_RUTA" | "FUERA_DE_SERVICIO";
}
