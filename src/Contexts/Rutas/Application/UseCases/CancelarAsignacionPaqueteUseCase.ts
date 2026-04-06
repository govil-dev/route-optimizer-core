
// Esta es solo la definición de la interfaz para el caso de uso.

export interface CancelarAsignacionPaqueteUseCase {
  execute(input: CancelarAsignacionPaqueteInput): Promise<void>;
}

export interface CancelarAsignacionPaqueteInput {
  paqueteId: string;
  motivo: string;
}
