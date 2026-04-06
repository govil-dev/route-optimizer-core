
import { ValueObject } from "../../../../Shared/Domain/ValueObject";
import { Ubicacion } from "./Ubicacion";

interface SegmentoRutaProps {
  origen: Ubicacion;
  destino: Ubicacion;
}

export class SegmentoRuta extends ValueObject<SegmentoRutaProps> {
  private constructor(props: SegmentoRutaProps) {
    super(props);
  }

  public static create(props: SegmentoRutaProps): SegmentoRuta {
    return new SegmentoRuta(props);
  }

  get origen(): Ubicacion {
    return this.props.origen;
  }

  get destino(): Ubicacion {
    return this.props.destino;
  }
}
