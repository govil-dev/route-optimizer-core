import { UseCase } from '../../../../../Shared/Application/UseCase';
import { CalcularRutaOptimaInput } from '../dtos/calcular-ruta-optima.input';
import { CalcularRutaOptimaOutput } from '../dtos/calcular-ruta-optima.output';

export abstract class CalcularRutaOptimaUseCase
  implements UseCase<CalcularRutaOptimaInput, CalcularRutaOptimaOutput>
{
  abstract execute(
    input: CalcularRutaOptimaInput,
  ): Promise<CalcularRutaOptimaOutput>;
}
