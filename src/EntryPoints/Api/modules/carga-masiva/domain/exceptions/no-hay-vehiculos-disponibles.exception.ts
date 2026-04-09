import { DomainException } from "../../../../../../Shared/Domain/Exceptions/DomainException";

export class NoHayVehiculosDisponiblesException extends DomainException {
    constructor(message: string) {
        super(message);
        this.name = "NoHayVehiculosDisponiblesException";
    }
}
