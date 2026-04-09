import { UseCase } from "../../../../Shared/Application/UseCase";
import { AsignarVehiculoARutaInput } from "../DTOs/AsignarVehiculoARuta.input";
import { AsignarVehiculoARutaOutput } from "../DTOs/AsignarVehiculoARuta.output";

export interface AsignarVehiculoARutaUseCase extends UseCase<AsignarVehiculoARutaInput, AsignarVehiculoARutaOutput> {
    execute(input: AsignarVehiculoARutaInput): Promise<AsignarVehiculoARutaOutput>;
}
