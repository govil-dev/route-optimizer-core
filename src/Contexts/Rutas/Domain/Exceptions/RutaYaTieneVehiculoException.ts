import { DomainException } from "../../../../Shared/Domain/Exceptions/DomainException";

export class RutaYaTieneVehiculoException extends DomainException {
    constructor(message: string = "La ruta ya tiene un vehículo asignado") {
        super(message);
        this.name = "RutaYaTieneVehiculoException";
    }
}
