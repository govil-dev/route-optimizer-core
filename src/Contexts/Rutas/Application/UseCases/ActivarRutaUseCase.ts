
// Esta es solo la definición de la interfaz para el caso de uso.

export interface ActivarRutaUseCase {
  execute(input: ActivarRutaInput): Promise<void>;
}

export interface ActivarRutaInput {
  rutaId: string;
}
