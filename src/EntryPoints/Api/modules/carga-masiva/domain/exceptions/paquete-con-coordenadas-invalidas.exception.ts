import { DomainException } from "../../../../../../Shared/Domain/Exceptions/DomainException";

export class PaqueteConCoordenadasInvalidasException extends DomainException {
    constructor(message: string) {
        super(message);
        this.name = "PaqueteConCoordenadasInvalidasException";
    }

}
