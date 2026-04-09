import { CargarPaquetesMasivamenteInput } from "../dtos/cargar-paquetes-masivamente.input";
import { CargarPaquetesMasivamenteOutput } from "../dtos/cargar-paquetes-masivamente.output";

export const CargarPaquetesMasivamenteUseCaseToken = "CargarPaquetesMasivamenteUseCase";

export interface CargarPaquetesMasivamenteUseCase {
    execute(input: CargarPaquetesMasivamenteInput): Promise<CargarPaquetesMasivamenteOutput>;
}
