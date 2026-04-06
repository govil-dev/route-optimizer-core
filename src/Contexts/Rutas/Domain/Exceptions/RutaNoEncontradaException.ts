
import { DomainException } from "../../../../Shared/Domain/Exceptions/DomainException";

export class RutaNoEncontradaException extends DomainException {
  constructor(rutaId: string) {
    super(`La ruta con ID "${rutaId}" no fue encontrada.`);
  }
}
