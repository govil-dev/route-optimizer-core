
import { ValueObject } from "../../../../Shared/Domain/ValueObject";
import { VentanaEntregaInvalidaException } from "../Exceptions/VentanaEntregaInvalidaException";

interface VentanaTiempoProps {
  inicio: Date;
  fin: Date;
}

export class VentanaTiempo extends ValueObject<VentanaTiempoProps> {
  private constructor(props: VentanaTiempoProps) {
    super(props);
  }

  public static create(props: VentanaTiempoProps): VentanaTiempo {
    if (props.inicio > props.fin) {
      throw new VentanaEntregaInvalidaException("La fecha de inicio no puede ser posterior a la fecha de fin.");
    }
    return new VentanaTiempo(props);
  }

  get inicio(): Date {
    return this.props.inicio;
  }

  get fin(): Date {
    return this.props.fin;
  }

  public seSolapaCon(otraVentana: VentanaTiempo): boolean {
    return this.inicio < otraVentana.fin && this.fin > otraVentana.inicio;
  }

  public getDuracionEnMilisegundos(): number {
    return this.fin.getTime() - this.inicio.getTime();
  }
}
