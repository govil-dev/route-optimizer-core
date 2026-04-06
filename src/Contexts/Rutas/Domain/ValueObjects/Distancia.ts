
import { ValueObject } from "../../../../Shared/Domain/ValueObject";

interface DistanciaProps {
  valor: number;
  unidad: string; // e.g., "km", "m"
}

export class Distancia extends ValueObject<DistanciaProps> {
  private constructor(props: DistanciaProps) {
    super(props);
  }

  public static create(props: DistanciaProps): Distancia {
    if (props.valor <= 0) {
      throw new Error("El valor de la distancia debe ser positivo.");
    }
    return new Distancia(props);
  }

  get valor(): number {
    return this.props.valor;
  }

  get unidad(): string {
    return this.props.unidad;
  }
}
