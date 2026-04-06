
import { ValueObject } from "../../../../Shared/Domain/ValueObject";

interface DuracionProps {
  valor: number;
  unidad: string; // e.g., "minutos", "horas"
}

export class Duracion extends ValueObject<DuracionProps> {
  private constructor(props: DuracionProps) {
    super(props);
  }

  public static create(props: DuracionProps): Duracion {
    if (props.valor <= 0) {
      throw new Error("El valor de la duración debe ser positivo.");
    }
    return new Duracion(props);
  }

  get valor(): number {
    return this.props.valor;
  }

  get unidad(): string {
    return this.props.unidad;
  }
}
