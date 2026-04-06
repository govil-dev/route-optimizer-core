
// Esta es solo la definición de la interfaz para el caso de uso.

export interface AgregarParadaARutaUseCase {
  execute(input: AgregarParadaARutaInput): Promise<void>;
}

export interface AgregarParadaARutaInput {
  rutaId: string;
  paqueteId: string;
  tipo: "RECOGIDA" | "ENTREGA";
  // La lógica de negocio determinará las horas estimadas
}
