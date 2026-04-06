
import { DomainException } from "../../../../Shared/Domain/Exceptions/DomainException";

export class ViolacionRestriccionRutaException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
