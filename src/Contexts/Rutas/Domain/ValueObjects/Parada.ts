
import { ValueObject } from "../../../../Shared/Domain/ValueObject";
import { PaqueteId } from "./PaqueteId";
import { Ubicacion } from "./Ubicacion";

export type TipoParada = "RECOGIDA" | "ENTREGA";

interface ParadaProps {
  ubicacion: Ubicacion;
  paqueteId: PaqueteId;
  tipo: TipoParada;
  horaLlegadaEstimada: Date;
  horaSalidaEstimada: Date;
}

export class Parada extends ValueObject<ParadaProps> {
  private constructor(props: ParadaProps) {
    super(props);
  }

  public static create(props: ParadaProps): Parada {
    if (props.horaLlegadaEstimada > props.horaSalidaEstimada) {
        throw new Error("La hora de llegada no puede ser posterior a la hora de salida.");
    }
    return new Parada(props);
  }

  get ubicacion(): Ubicacion {
    return this.props.ubicacion;
  }

  get paqueteId(): PaqueteId {
    return this.props.paqueteId;
  }

  get tipo(): TipoParada {
    return this.props.tipo;
  }

  get horaLlegadaEstimada(): Date {
    return this.props.horaLlegadaEstimada;
  }

  get horaSalidaEstimada(): Date {
    return this.props.horaSalidaEstimada;
  }
}
