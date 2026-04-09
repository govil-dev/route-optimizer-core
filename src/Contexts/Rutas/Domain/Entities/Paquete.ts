import { Entity } from "../../../../Shared/Domain/Entity";
import { PaqueteId } from "../ValueObjects/PaqueteId";
import { Ubicacion } from "../ValueObjects/Ubicacion";
import { EstadoPaquete, EstadoPaqueteEnum } from "../Enums/EstadoPaquete";
import { EstadoInvalidoPaqueteException } from "../Exceptions/EstadoInvalidoPaqueteException";
import { VentanaTiempo } from "../ValueObjects/VentanaTiempo";

export interface PaqueteProps {
    origen: Ubicacion;
    destino: Ubicacion;
    peso: number; // en kg
    dimensiones: { alto: number; ancho: number; largo: number }; // en cm
    estado: EstadoPaquete;
    ventanaEntrega?: VentanaTiempo;
    codigoRazonFallo?: string;
}

export class Paquete extends Entity<PaqueteProps> {
    private constructor(props: PaqueteProps, id?: PaqueteId) {
        super(props, id);
    }

    public static create(props: PaqueteProps, id?: PaqueteId): Paquete {
        return new Paquete(props, id);
    }

    get origen(): Ubicacion { return this.props.origen; }
    get destino(): Ubicacion { return this.props.destino; }
    get peso(): number { return this.props.peso; }
    get dimensiones(): { alto: number; ancho: number; largo: number } { return this.props.dimensiones; }
    get estado(): EstadoPaquete { return this.props.estado; }
    get ventanaEntrega(): VentanaTiempo | undefined { return this.props.ventanaEntrega; }
    get codigoRazonFallo(): string | undefined { return this.props.codigoRazonFallo; }

    public marcarAsignado(): void {
        if (this.props.estado.getValue() !== EstadoPaqueteEnum.PENDIENTE) {
            throw new EstadoInvalidoPaqueteException("El paquete solo puede ser asignado si está en estado PENDIENTE.");
        }
        this.props.estado = EstadoPaquete.create(EstadoPaqueteEnum.ASIGNADO).getValue();
    }

    public marcarEnTransito(): void {
        if (this.props.estado.getValue() !== EstadoPaqueteEnum.ASIGNADO) {
            throw new EstadoInvalidoPaqueteException("El paquete solo puede ser marcado en tránsito si está ASIGNADO.");
        }
        this.props.estado = EstadoPaquete.create(EstadoPaqueteEnum.EN_TRANSITO).getValue();
    }

    public marcarEntregado(): void {
        const estadoActual = this.props.estado.getValue();
        if (estadoActual !== EstadoPaqueteEnum.ASIGNADO && estadoActual !== EstadoPaqueteEnum.EN_TRANSITO) {
            throw new EstadoInvalidoPaqueteException(`El paquete solo puede ser entregado si está ASIGNADO o EN TRANSITO, pero está en ${estadoActual}.`);
        }
        this.props.estado = EstadoPaquete.create(EstadoPaqueteEnum.ENTREGADO).getValue();
    }
    
    public marcarFallido(codigoRazon: string): void {
        const estadoActual = this.props.estado.getValue();
        if (estadoActual !== EstadoPaqueteEnum.ASIGNADO && estadoActual !== EstadoPaqueteEnum.EN_TRANSITO) {
            throw new EstadoInvalidoPaqueteException(`No se puede marcar como fallido un paquete en estado ${estadoActual}.`);
        }
        this.props.estado = EstadoPaquete.create(EstadoPaqueteEnum.FALLIDO).getValue();
        this.props.codigoRazonFallo = codigoRazon;
    }

    public cancelar(): void {
        const estadoActual = this.props.estado.getValue();
        if (estadoActual === EstadoPaqueteEnum.ENTREGADO || estadoActual === EstadoPaqueteEnum.CANCELADO) {
            throw new EstadoInvalidoPaqueteException(`No se puede cancelar un paquete en estado ${estadoActual}.`);
        }
        this.props.estado = EstadoPaquete.create(EstadoPaqueteEnum.CANCELADO).getValue();
    }
}
