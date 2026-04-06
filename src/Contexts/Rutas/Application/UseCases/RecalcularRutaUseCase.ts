
// Esta es solo la definición de la interfaz para el caso de uso.

export interface RecalcularRutaUseCase {
  execute(input: RecalcularRutaInput): Promise<void>;
}

export interface RecalcularRutaInput {
  rutaId: string;
}
