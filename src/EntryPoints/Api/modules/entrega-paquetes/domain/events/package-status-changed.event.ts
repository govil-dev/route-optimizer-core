import { IDomainEvent } from "../../../../../Shared/Domain/DomainEvent";

export interface PackageStatusChangedEvent extends IDomainEvent {
    paqueteId: string;
    nuevoEstado: "ENTREGADO" | "FALLIDO";
    timestamp: Date;
    ubicacion: { latitud: number; longitud: number; };
    codigoRazonFallo?: string;
}
