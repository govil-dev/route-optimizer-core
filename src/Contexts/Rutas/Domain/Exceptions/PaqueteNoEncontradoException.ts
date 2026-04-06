
import { DomainException } from "../../../../Shared/Domain/Exceptions/DomainException";

export class PaqueteNoEncontradoException extends DomainException {
  constructor(paqueteId: string) {
    super(`El paquete con ID "${paqueteId}" no fue encontrado.`);
  }
}
