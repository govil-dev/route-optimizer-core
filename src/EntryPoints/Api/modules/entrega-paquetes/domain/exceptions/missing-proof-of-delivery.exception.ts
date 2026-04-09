import { DomainException } from "../../../../../Shared/Domain/Exceptions/DomainException";

export class MissingProofOfDeliveryException extends DomainException {
    constructor() {
        super("Se requiere prueba de entrega (foto o firma) para marcar el paquete como entregado.");
    }
}
