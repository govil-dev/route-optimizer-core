export interface MarcarEstadoEntregaPaqueteInput {
  paqueteId: string;
  estadoEntrega: "ENTREGADO" | "FALLIDO";
  ubicacionActual: { latitud: number; longitud: number; };
  pruebaDeEntrega?: { tipo: "FOTO" | "FIRMA"; url: string; }; // Requerido para ENTREGADO
  codigoRazonFallo?: string; // Requerido para FALLIDO
}
