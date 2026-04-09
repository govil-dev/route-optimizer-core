export interface MarcarEstadoEntregaPaqueteOutput {
  paqueteId: string;
  nuevoEstado: "ENTREGADO" | "FALLIDO";
  timestamp: Date;
}
