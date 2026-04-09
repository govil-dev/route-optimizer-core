import { DomainException } from "../../../../../../Shared/Domain/Exceptions/DomainException";

export class FormatoArchivoInvalidoException extends DomainException {
    constructor(message: string) {
        super(message);
        this.name = "FormatoArchivoInvalidoException";
    }
}
