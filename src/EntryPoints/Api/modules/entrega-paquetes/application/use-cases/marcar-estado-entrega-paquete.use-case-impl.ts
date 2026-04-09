import { Inject, Injectable } from "@nestjs/common";
import { MarcarEstadoEntregaPaqueteUseCase, MarcarEstadoEntregaPaqueteUseCaseToken } from "./marcar-estado-entrega-paquete.use-case";
import { MarcarEstadoEntregaPaqueteInput } from "../dtos/marcar-estado-entrega-paquete.input";
import { MarcarEstadoEntregaPaqueteOutput } from "../dtos/marcar-estado-entrega-paquete.output";
import { RepositorioPaquetes } from "../../../../../Contexts/Rutas/Domain/Ports/RepositorioPaquetes";
import { IEventPublisher, IEventPublisherToken } from "../../domain/ports/event-publisher";
import { PaqueteNoEncontradoException } from "../../../../../Contexts/Rutas/Domain/Exceptions/PaqueteNoEncontradoException";
import { PaqueteId } from "../../../../../Contexts/Rutas/Domain/ValueObjects/PaqueteId";
import { EstadoInvalidoPaqueteException } from "../../../../../Contexts/Rutas/Domain/Exceptions/EstadoInvalidoPaqueteException";
import { EstadoPaqueteEnum } from "../../../../../Contexts/Rutas/Domain/Enums/EstadoPaquete";
import { GeofenceViolationException } from "../../domain/exceptions/geofence-violation.exception";
import { MissingProofOfDeliveryException } from "../../domain/exceptions/missing-proof-of-delivery.exception";
import { MissingReasonCodeException } from "../../domain/exceptions/missing-reason-code.exception";
import { PackageStatusChangedEvent } from "../../domain/events/package-status-changed.event";
import { Ubicacion } from "../../../../../Contexts/Rutas/Domain/ValueObjects/Ubicacion";

@Injectable()
export class MarcarEstadoEntregaPaqueteUseCaseImpl implements MarcarEstadoEntregaPaqueteUseCase {

    constructor(
        @Inject("RepositorioPaquetes")
        private readonly repositorioPaquetes: RepositorioPaquetes,
        @Inject(IEventPublisherToken)
        private readonly eventPublisher: IEventPublisher,
    ) {}

    async execute(input: MarcarEstadoEntregaPaqueteInput): Promise<MarcarEstadoEntregaPaqueteOutput> {
        // Paso 1: Recuperar Paquete
        const paqueteId = PaqueteId.create(input.paqueteId);
        const paquete = await this.repositorioPaquetes.obtenerPorId(paqueteId);
        if (!paquete) {
            throw new PaqueteNoEncontradoException(`Paquete con id ${input.paqueteId} no encontrado.`);
        }

        // Paso 2: Validar Estado Actual del Paquete
        const estadoActual = paquete.estado.getValue();
        if (estadoActual !== EstadoPaqueteEnum.ASIGNADO && estadoActual !== EstadoPaqueteEnum.EN_TRANSITO) {
            throw new EstadoInvalidoPaqueteException(`El estado del paquete es ${estadoActual}, pero se esperaba ASIGNADO o EN_TRANSITO.`);
        }

        // Paso 3: Lógica Condicional por estadoEntrega
        if (input.estadoEntrega === "ENTREGADO") {
            // BR-03 (Validación de Geocerca)
            const ubicacionActual = Ubicacion.create(input.ubicacionActual.latitud, input.ubicacionActual.longitud);
            const distancia = this.calcularDistanciaEnMetros(ubicacionActual.props, paquete.destino.props);
            if (distancia > 50) {
                throw new GeofenceViolationException();
            }

            // EX-04 (Prueba de Entrega)
            if (!input.pruebaDeEntrega) {
                throw new MissingProofOfDeliveryException();
            }

            paquete.marcarEntregado();
        } else if (input.estadoEntrega === "FALLIDO") {
            // BR-04 (Código de Razón)
            if (!input.codigoRazonFallo || input.codigoRazonFallo.trim() === "") {
                throw new MissingReasonCodeException();
            }
            paquete.marcarFallido(input.codigoRazonFallo);
        }

        // Paso 4: Persistir Cambios
        await this.repositorioPaquetes.guardar(paquete);

        // Paso 5: Publicar Evento
        const event: PackageStatusChangedEvent = {
            name: "PackageStatusChangedEvent",
            paqueteId: paquete.id.toString(),
            nuevoEstado: input.estadoEntrega,
            timestamp: new Date(),
            ubicacion: input.ubicacionActual,
            codigoRazonFallo: input.codigoRazonFallo,
        };
        await this.eventPublisher.publish(event);

        // Paso 6: Retornar Output
        return {
            paqueteId: paquete.id.toString(),
            nuevoEstado: input.estadoEntrega,
            timestamp: event.timestamp,
        };
    }

    private calcularDistanciaEnMetros(coord1: { latitud: number; longitud: number; }, coord2: { latitud: number; longitud: number; }): number {
        const R = 6371e3; // metres
        const φ1 = coord1.latitud * Math.PI / 180; // φ, λ in radians
        const φ2 = coord2.latitud * Math.PI / 180;
        const Δφ = (coord2.latitud - coord1.latitud) * Math.PI / 180;
        const Δλ = (coord2.longitud - coord1.longitud) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // in metres
    }
}
