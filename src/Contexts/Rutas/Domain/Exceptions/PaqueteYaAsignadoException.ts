
import { DomainException } from "../../../../Shared/Domain/Exceptions/DomainException";

export class PaqueteYaAsignadoException extends DomainException {
  constructor(paqueteId: string, rutaId: string) {
    super(`El paquete con ID "${paqueteId}" ya se encuentra asignado a la ruta "${rutaId}".`);
  }
}
