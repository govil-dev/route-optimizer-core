
// Esta es solo la definición de la interfaz para el caso de uso.

export interface AsignarPaqueteARutaUseCase {
  execute(input: AsignarPaqueteARutaInput): Promise<void>;
}

export interface AsignarPaqueteARutaInput {
  paqueteId: string;
  rutaId: string;
}
