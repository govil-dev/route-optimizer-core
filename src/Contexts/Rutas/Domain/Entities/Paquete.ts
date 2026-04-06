
import { AggregateRoot } from "../../../Shared/Domain/Entities/AggregateRoot";
import { UniqueEntityID } from "../../../Shared/Domain/Entities/UniqueEntityID";
import { Result } from "../../../Shared/Domain/Result";
import { EstadoPaquete } from "../ValueObjects/EstadoPaquete";
import { Ubicacion } from "../ValueObjects/Ubicacion";
import { VentanaTiempo } from "../ValueObjects/VentanaTiempo";

export interface PaqueteProps {
  descripcion: string;
  peso: number; // en kg
  volumen: number; // en m^3
  origen: Ubicacion;
  destino: Ubicacion;
  estado: EstadoPaquete;
  ventanaTiempoEntrega?: VentanaTiempo;
  rutaAsignadaId?: UniqueEntityID;
  perecedero: boolean; // NUEVA PROPIEDAD
}

export class Paquete extends AggregateRoot<PaqueteProps> {
  private constructor(props: PaqueteProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: Omit<PaqueteProps, "estado" | "perecedero"> & { perecedero?: boolean }, id?: UniqueEntityID): Result<Paquete> {
    const paqueteProps: PaqueteProps = {
      ...props,
      estado: EstadoPaquete.create("PENDIENTE").getValue(),
      perecedero: props.perecedero ?? false, // Por defecto es false
    };
    const paquete = new Paquete(paqueteProps, id);
    return Result.ok<Paquete>(paquete);
  }

  get descripcion(): string {
    return this.props.descripcion;
  }

  get peso(): number {
    return this.props.peso;
  }

  get volumen(): number {
    return this.props.volumen;
  }

  get origen(): Ubicacion {
    return this.props.origen;
  }

  get destino(): Ubicacion {
    return this.props.destino;
  }

  get estado(): EstadoPaquete {
    return this.props.estado;
  }

  get ventanaTiempoEntrega(): VentanaTiempo | undefined {
    return this.props.ventanaTiempoEntrega;
  }

  get rutaAsignadaId(): UniqueEntityID | undefined {
    return this.props.rutaAsignadaId;
  }

  get perecedero(): boolean {
    return this.props.perecedero;
  }

  public asignarARuta(rutaId: UniqueEntityID): void {
    if (this.props.estado.getValue() !== "PENDIENTE") {
      // Debería lanzarse una excepción de dominio aquí
      // throw new EstadoInvalidoPaqueteException("El paquete no está en estado PENDIENTE");
    }
    this.props.rutaAsignadaId = rutaId;
    this.props.estado = EstadoPaquete.create("ASIGNADO").getValue();
  }
}
