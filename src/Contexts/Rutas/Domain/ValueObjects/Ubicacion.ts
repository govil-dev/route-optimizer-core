
import { ValueObject } from "../../../../Shared/Domain/ValueObject";

interface UbicacionProps {
  latitud: number;
  longitud: number;
  direccion?: string;
}

export class Ubicacion extends ValueObject<UbicacionProps> {
  private constructor(props: UbicacionProps) {
    super(props);
  }

  public static create(props: UbicacionProps): Ubicacion {
    return new Ubicacion(props);
  }

  get latitud(): number {
    return this.props.latitud;
  }

  get longitud(): number {
    return this.props.longitud;
  }

  get direccion(): string | undefined {
    return this.props.direccion;
  }
}
