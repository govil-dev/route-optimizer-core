
import { DomainException } from "../../../../Shared/Domain/Exceptions/DomainException";

export class CapacidadVehiculoExcedidaException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
