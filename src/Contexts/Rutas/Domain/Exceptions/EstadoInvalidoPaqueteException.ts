
import { DomainException } from "../../../../Shared/Domain/Exceptions/DomainException";
import { EstadoPaquete } from "../Enums/EstadoPaquete";

export class EstadoInvalidoPaqueteException extends DomainException {
  constructor(estadoActual: EstadoPaquete, estadoIntentado: EstadoPaquete) {
    super(`No se puede cambiar el estado del paquete de "${estadoActual}" a "${estadoIntentado}".`);
  }
}
