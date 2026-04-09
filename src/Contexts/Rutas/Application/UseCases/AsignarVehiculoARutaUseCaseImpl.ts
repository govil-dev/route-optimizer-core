import { Inject, Injectable } from "@nestjs/common";
import { AsignarVehiculoARutaUseCase } from "./AsignarVehiculoARutaUseCase";
import { AsignarVehiculoARutaInput } from "../DTOs/AsignarVehiculoARuta.input";
import { AsignarVehiculoARutaOutput } from "../DTOs/AsignarVehiculoARuta.output";
import { RepositorioRutas } from "../../Domain/Ports/RepositorioRutas";
import { RepositorioVehiculos } from "../../Domain/Ports/RepositorioVehiculos";
import { RutaNoEncontradaException } from "../../Domain/Exceptions/RutaNoEncontradaException";
import { VehiculoNoEncontradoException } from "../../Domain/Exceptions/VehiculoNoEncontradoException";
import { RutaId } from "../../Domain/ValueObjects/RutaId";
import { VehiculoId } from "../../Domain/ValueObjects/VehiculoId";

@Injectable()
export class AsignarVehiculoARutaUseCaseImpl implements AsignarVehiculoARutaUseCase {

    constructor(
        @Inject("RepositorioRutas") private readonly repositorioRutas: RepositorioRutas,
        @Inject("RepositorioVehiculos") private readonly repositorioVehiculos: RepositorioVehiculos
    ) {}

    async execute(input: AsignarVehiculoARutaInput): Promise<AsignarVehiculoARutaOutput> {
        const rutaId = new RutaId(input.rutaId);
        const vehiculoId = new VehiculoId(input.vehiculoId);

        const ruta = await this.repositorioRutas.findById(rutaId);
        if (!ruta) {
            throw new RutaNoEncontradaException(`Ruta con id ${input.rutaId} no encontrada`);
        }

        const vehiculo = await this.repositorioVehiculos.findById(vehiculoId);
        if (!vehiculo) {
            throw new VehiculoNoEncontradoException(`Vehículo con id ${input.vehiculoId} no encontrado`);
        }

        ruta.asignarVehiculo(vehiculo);

        await this.repositorioRutas.save(ruta);
        // Asumimos que el repositorio de vehículos también necesita guardar el estado actualizado
        await this.repositorioVehiculos.save(vehiculo);

        return new AsignarVehiculoARutaOutput(
            ruta.id.getValue(),
            ruta.getVehiculoId()!.getValue(),
            ruta.getEstado()
        );
    }
}
