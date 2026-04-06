
// Esta es solo la definición de la interfaz para el caso de uso.

export interface MarcarPaqueteEnTransitoUseCase {
  execute(input: MarcarPaqueteEnTransitoInput): Promise<void>;
}

export interface MarcarPaqueteEnTransitoInput {
  paqueteId: string;
}
