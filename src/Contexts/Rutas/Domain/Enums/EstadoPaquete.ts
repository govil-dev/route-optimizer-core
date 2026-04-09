import { Result, ValueObject } from "../../../../Shared/Domain";

export enum EstadoPaqueteEnum {
    PENDIENTE = "PENDIENTE",
    ASIGNADO = "ASIGNADO",
    EN_TRANSITO = "EN_TRANSITO",
    ENTREGADO = "ENTREGADO",
    CANCELADO = "CANCELADO",
    FALLIDO = "FALLIDO",
}

interface EstadoPaqueteProps {
    value: EstadoPaqueteEnum;
}

export class EstadoPaquete extends ValueObject<EstadoPaqueteProps> {
    private constructor(props: EstadoPaqueteProps) {
        super(props);
    }

    public getValue(): EstadoPaqueteEnum {
        return this.props.value;
    }

    public static create(value: string): Result<EstadoPaquete> {
        if (!Object.values(EstadoPaqueteEnum).includes(value as EstadoPaqueteEnum)) {
            return Result.fail<EstadoPaquete>("Estado de paquete inválido");
        }
        return Result.ok<EstadoPaquete>(new EstadoPaquete({ value: value as EstadoPaqueteEnum }));
    }
}
