
import { DomainException } from "../../../../Shared/Domain/Exceptions/DomainException";

export class VentanaEntregaInvalidaException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
