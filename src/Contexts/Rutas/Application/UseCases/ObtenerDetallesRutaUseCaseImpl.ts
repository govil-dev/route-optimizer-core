import { Inject, Injectable } from "@nestjs/common";
import { ObtenerDetallesRutaUseCase } from "./ObtenerDetallesRutaUseCase";
import { ObtenerDetallesRutaInput } from "../DTOs/ObtenerDetallesRuta.input";
import { ObtenerDetallesRutaOutput } from "../DTOs/ObtenerDetallesRuta.output";
import { RepositorioRutas } from "../../Domain/Ports/RepositorioRutas";
import { RutaId } from "../../Domain/ValueObjects/RutaId";
import { RutaNoEncontradaException } from "../../Domain/Exceptions/RutaNoEncontradaException";
import { Ruta } from "../../Domain/Aggregates/Ruta";

@Injectable()
export class ObtenerDetallesRutaUseCaseImpl implements ObtenerDetallesRutaUseCase {

    constructor(
        @Inject("RepositorioRutas")
        private readonly repositorioRutas: RepositorioRutas
    ) {}

    async execute(input: ObtenerDetallesRutaInput): Promise<ObtenerDetallesRutaOutput> {
        const rutaId = new RutaId(input.rutaId);
        const ruta = await this.repositorioRutas.buscarPorId(rutaId);

        if (!ruta) {
            throw new RutaNoEncontradaException(`La ruta con ID ${input.rutaId} no fue encontrada.`);
        }

        return this.mapToOutput(ruta);
    }

    private mapToOutput(ruta: Ruta): ObtenerDetallesRutaOutput {
        const props = ruta.getProps();
        
        return {
            rutaId: props.id.toString(),
            estado: props.estado.toString(),
            origen: {
                latitud: props.origen.getLatitud(),
                longitud: props.origen.getLongitud(),
            },
            destino: {
                latitud: props.destino.getLatitud(),
                longitud: props.destino.getLongitud(),
            },
            paradas: props.paradas.map(parada => ({
                direccion: parada.getUbicacion().getDireccion(),
                latitud: parada.getUbicacion().getLatitud(),
                longitud: parada.getUbicacion().getLongitud(),
                paqueteId: parada.getPaqueteId()?.toString(),
                tiempoEstimadoLlegada: parada.getVentanaTiempo()?.getInicio(),
                tiempoEstimadoSalida: parada.getVentanaTiempo()?.getFin(),
            })),
            vehiculoAsignado: props.vehiculoId ? {
                vehiculoId: props.vehiculoId.toString(),
                placa: "N/A", // Placeholder: La información detallada del vehículo requeriría una consulta adicional.
                capacidad: 0, // Placeholder
            } : undefined,
            distanciaTotalKm: props.distanciaTotal.getKilometros(),
            duracionEstimadaMin: props.duracionEstimada.getMinutos(),
            fechaCreacion: props.fechaCreacion,
        };
    }
}
