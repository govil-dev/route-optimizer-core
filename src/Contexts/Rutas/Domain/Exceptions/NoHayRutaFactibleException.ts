
import { DomainException } from "../../../../Shared/Domain/Exceptions/DomainException";

export class NoHayRutaFactibleException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
