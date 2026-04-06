
// Esta es solo la definición de la interfaz para el caso de uso.

export interface MarcarPaqueteEntregadoUseCase {
  execute(input: MarcarPaqueteEntregadoInput): Promise<void>;
}

export interface MarcarPaqueteEntregadoInput {
  paqueteId: string;
  // Podría incluir prueba de entrega, firma, etc.
}
