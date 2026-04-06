
import { DomainException } from "../../../../Shared/Domain/Exceptions/DomainException";

export class VehiculoNoEncontradoException extends DomainException {
  constructor(vehiculoId: string) {
    super(`El vehículo con ID "${vehiculoId}" no fue encontrado.`);
  }
}
