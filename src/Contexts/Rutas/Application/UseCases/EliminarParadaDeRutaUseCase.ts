
// Esta es solo la definición de la interfaz para el caso de uso.

export interface EliminarParadaDeRutaUseCase {
  execute(input: EliminarParadaDeRutaInput): Promise<void>;
}

export interface EliminarParadaDeRutaInput {
  rutaId: string;
  paqueteId: string;
}
