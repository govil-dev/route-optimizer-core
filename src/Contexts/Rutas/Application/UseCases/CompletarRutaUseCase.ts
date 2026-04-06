
// Esta es solo la definición de la interfaz para el caso de uso.

export interface CompletarRutaUseCase {
  execute(input: CompletarRutaInput): Promise<void>;
}

export interface CompletarRutaInput {
  rutaId: string;
}
