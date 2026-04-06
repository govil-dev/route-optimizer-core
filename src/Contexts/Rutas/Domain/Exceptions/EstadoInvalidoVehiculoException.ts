
import { DomainException } from "../../../../Shared/Domain/Exceptions/DomainException";
import { EstadoVehiculo } from "../Enums/EstadoVehiculo";

export class EstadoInvalidoVehiculoException extends DomainException {
    constructor(estadoActual: EstadoVehiculo, estadoIntentado: EstadoVehiculo) {
        super(`No se puede cambiar el estado del vehículo de "${estadoActual}" a "${estadoIntentado}".`);
    }
}
