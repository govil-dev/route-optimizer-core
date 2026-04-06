
import { DomainException } from "../../../../Shared/Domain/Exceptions/DomainException";
import { EstadoRuta } from "../Enums/EstadoRuta";

export class EstadoInvalidoRutaException extends DomainException {
  constructor(estadoActual: EstadoRuta, estadoIntentado: EstadoRuta) {
    super(`No se puede cambiar el estado de la ruta de "${estadoActual}" a "${estadoIntentado}".`);
  }
}
