import { DomainException } from "../../../../../Shared/Domain/Exceptions/DomainException";

export class GeofenceViolationException extends DomainException {
    constructor() {
        super("La ubicación actual está fuera de la geocerca de destino (más de 50 metros).");
    }
}
