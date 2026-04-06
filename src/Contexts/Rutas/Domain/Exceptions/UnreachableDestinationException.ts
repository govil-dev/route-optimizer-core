
import { DomainException } from "../../../Shared/Domain/Exceptions/DomainException";

export class UnreachableDestinationException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = "UnreachableDestinationException";
  }
}
