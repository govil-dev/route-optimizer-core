import { DomainException } from "../../../../../Shared/Domain/Exceptions/DomainException";

export class MissingReasonCodeException extends DomainException {
    constructor() {
        super("Se requiere un código de razón para marcar el paquete como fallido.");
    }
}
