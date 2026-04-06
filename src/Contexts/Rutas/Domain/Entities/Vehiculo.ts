
import { Entity } from "../../../../Shared/Domain/Entity";
import { EstadoVehiculo } from "../Enums/EstadoVehiculo";
import { EstadoInvalidoVehiculoException } from "../Exceptions/EstadoInvalidoVehiculoException";
import { Ubicacion } from "../ValueObjects/Ubicacion";
import { VehiculoId } from "../ValueObjects/VehiculoId";

interface VehiculoProps {
  matricula: string;
  capacidadMaximaPeso: number;
  capacidadMaximaVolumen: number;
  ubicacionActual: Ubicacion;
  estado: EstadoVehiculo;
}

export class Vehiculo extends Entity<VehiculoProps> {
  private constructor(props: VehiculoProps, id?: VehiculoId) {
    super(props, id);
  }

  public static create(props: VehiculoProps, id?: VehiculoId): Vehiculo {
    if (props.capacidadMaximaPeso <= 0 || props.capacidadMaximaVolumen <= 0) {
      throw new Error("Las capacidades del vehículo deben ser positivas.");
    }
    return new Vehiculo(props, id);
  }

  get id(): VehiculoId {
    return this._id as VehiculoId;
  }

  get matricula(): string {
    return this.props.matricula;
  }

  get capacidadMaximaPeso(): number {
    return this.props.capacidadMaximaPeso;
  }

  get capacidadMaximaVolumen(): number {
    return this.props.capacidadMaximaVolumen;
  }

  get ubicacionActual(): Ubicacion {
    return this.props.ubicacionActual;
  }

  get estado(): EstadoVehiculo {
    return this.props.estado;
  }

  public actualizarUbicacion(nuevaUbicacion: Ubicacion): void {
    this.props.ubicacionActual = nuevaUbicacion;
  }

  public cambiarEstado(nuevoEstado: EstadoVehiculo): void {
    // Aquí se podrían añadir reglas de transición más complejas si fuera necesario.
    // Por ejemplo, un vehículo no puede pasar de FUERA_DE_SERVICIO a EN_RUTA directamente.
    if (this.props.estado === nuevoEstado) return;

    // Ejemplo de regla simple:
    if (this.props.estado === EstadoVehiculo.FUERA_DE_SERVICIO && nuevoEstado === EstadoVehiculo.EN_RUTA) {
        throw new EstadoInvalidoVehiculoException(this.props.estado, nuevoEstado);
    }

    this.props.estado = nuevoEstado;
  }
}
