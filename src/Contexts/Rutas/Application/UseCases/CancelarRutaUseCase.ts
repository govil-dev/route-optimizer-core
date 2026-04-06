
// Esta es solo la definición de la interfaz para el caso de uso.

export interface CancelarRutaUseCase {
  execute(input: CancelarRutaInput): Promise<void>;
}

export interface CancelarRutaInput {
  rutaId: string;
  motivo: string;
}
