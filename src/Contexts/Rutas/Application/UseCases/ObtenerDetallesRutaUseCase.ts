import { UseCase } from "../../../../Shared/Application/UseCase";
import { ObtenerDetallesRutaInput } from "../DTOs/ObtenerDetallesRuta.input";
import { ObtenerDetallesRutaOutput } from "../DTOs/ObtenerDetallesRuta.output";

export interface ObtenerDetallesRutaUseCase extends UseCase<ObtenerDetallesRutaInput, ObtenerDetallesRutaOutput> {
    execute(input: ObtenerDetallesRutaInput): Promise<ObtenerDetallesRutaOutput>;
}
