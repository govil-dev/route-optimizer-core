
import { ValueObject } from "../../../../Shared/Domain/ValueObject";

interface CondicionTraficoProps {
  tipo: string; // e.g., "ligero", "moderado", "pesado"
  factorImpacto: number; // e.g., 1.0 (sin impacto), 1.5 (50% más lento)
}

export class CondicionTrafico extends ValueObject<CondicionTraficoProps> {
  private constructor(props: CondicionTraficoProps) {
    super(props);
  }

  public static create(props: CondicionTraficoProps): CondicionTrafico {
    if (props.factorImpacto <= 0) {
      throw new Error("El factor de impacto del tráfico debe ser positivo.");
    }
    return new CondicionTrafico(props);
  }

  get tipo(): string {
    return this.props.tipo;
  }

  get factorImpacto(): number {
    return this.props.factorImpacto;
  }
}
