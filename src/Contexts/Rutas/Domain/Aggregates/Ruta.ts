
import { AggregateRoot } from "../../../../Shared/Domain/AggregateRoot";
import { EstadoRuta } from "../Enums/EstadoRuta";
import { EstadoInvalidoRutaException } from "../Exceptions/EstadoInvalidoRutaException";
import { CondicionTrafico } from "../ValueObjects/CondicionTrafico";
import { Distancia } from "../ValueObjects/Distancia";
import { Duracion } from "../ValueObjects/Duracion";
import { Parada } from "../ValueObjects/Parada";
import { PaqueteId } from "../ValueObjects/PaqueteId";
import { RutaId } from "../ValueObjects/RutaId";
import { SegmentoRuta } from "../ValueObjects/SegmentoRuta";
import { VehiculoId } from "../ValueObjects/VehiculoId";
import { CapacidadVehiculoExcedidaException } from "../Exceptions/CapacidadVehiculoExcedidaException";
import { ViolacionRestriccionRutaException } from "../Exceptions/ViolacionRestriccionRutaException";
import { Paquete } from "../Entities/Paquete";
import { Vehiculo } from "../Entities/Vehiculo";

interface RutaProps {
  vehiculoId: VehiculoId;
  paradas: Parada[];
  horaInicioEstimada: Date;
  horaFinEstimada: Date;
  distanciaTotalEstimada: Distancia;
  duracionTotalEstimada: Duracion;
  estado: EstadoRuta;
}

export class Ruta extends AggregateRoot<RutaProps> {
  private constructor(props: RutaProps, id?: RutaId) {
    super(props, id);
  }

  public static create(props: RutaProps, id?: RutaId): Ruta {
    // Las validaciones complejas se realizan a través de los métodos de comportamiento.
    return new Ruta(props, id);
  }

  get id(): RutaId {
    return this._id as RutaId;
  }

  get vehiculoId(): VehiculoId {
    return this.props.vehiculoId;
  }

  get paradas(): Readonly<Parada[]> {
    return this.props.paradas;
  }

  get estado(): EstadoRuta {
    return this.props.estado;
  }

  // --- Comportamiento y Reglas de Negocio ---

  public agregarParada(parada: Parada, paquete: Paquete, vehiculo: Vehiculo, paquetesEnRuta: Paquete[]): void {
    if (this.estado !== EstadoRuta.PLANIFICADA && this.estado !== EstadoRuta.OPTIMIZANDO) {
      throw new Error("Solo se pueden agregar paradas a rutas en estado de planificación u optimización.");
    }

    // Validar que el paquete no esté ya en la ruta
    if (this.props.paradas.some(p => p.paqueteId.equals(parada.paqueteId))) {
        throw new ViolacionRestriccionRutaException(`El paquete ${parada.paqueteId} ya está en la ruta.`);
    }

    // Validar capacidad del vehículo
    const pesoTotal = paquetesEnRuta.reduce((sum, p) => sum + p.peso, 0) + paquete.peso;
    const volumenTotal = paquetesEnRuta.reduce((sum, p) => sum + p.volumen, 0) + paquete.volumen;

    if (pesoTotal > vehiculo.capacidadMaximaPeso || volumenTotal > vehiculo.capacidadMaximaVolumen) {
      throw new CapacidadVehiculoExcedidaException("La adición del paquete excede la capacidad del vehículo.");
    }

    // Validar ventana de tiempo (simplificado, una implementación real requeriría recalcular toda la ruta)
    if (parada.horaLlegadaEstimada > paquete.ventanaEntrega.fin) {
        throw new ViolacionRestriccionRutaException(`La hora de llegada estimada para el paquete ${paquete.id} está fuera de su ventana de entrega.`);
    }

    this.props.paradas.push(parada);
    // Nota: En un caso real, se debería recalcular la ruta (tiempos, distancias) aquí.
  }

  public eliminarParada(paqueteId: PaqueteId): void {
    if (this.estado !== EstadoRuta.PLANIFICADA && this.estado !== EstadoRuta.OPTIMIZANDO) {
        throw new Error("Solo se pueden eliminar paradas de rutas en estado de planificación u optimización.");
    }
    const index = this.props.paradas.findIndex(p => p.paqueteId.equals(paqueteId));
    if (index === -1) {
      throw new Error(`El paquete con ID ${paqueteId} no se encontró en las paradas de la ruta.`);
    }
    this.props.paradas.splice(index, 1);
    // Nota: En un caso real, se debería recalcular la ruta (tiempos, distancias) aquí.
  }

  public recalcularRuta(condicionesTrafico: Map<SegmentoRuta, CondicionTrafico>): void {
    // Lógica para recalcular `horaFinEstimada`, `distanciaTotalEstimada`, `duracionTotalEstimada`
    // Esta es una operación compleja que dependería de un servicio externo o un algoritmo.
    // Por simplicidad, aquí solo se simula la actualización.
    console.log("Recalculando ruta con condiciones de tráfico:", condicionesTrafico);
    // this.props.duracionTotalEstimada = ...
    // this.props.horaFinEstimada = ...
  }

  public activarRuta(): void {
    if (this.props.estado !== EstadoRuta.PLANIFICADA) {
      throw new EstadoInvalidoRutaException(this.props.estado, EstadoRuta.ACTIVA);
    }
    this.props.estado = EstadoRuta.ACTIVA;
    // this.addDomainEvent(new RutaActivadaEvent(this.id));
  }

  public completarRuta(): void {
    if (this.props.estado !== EstadoRuta.ACTIVA) {
      throw new EstadoInvalidoRutaException(this.props.estado, EstadoRuta.COMPLETADA);
    }
    this.props.estado = EstadoRuta.COMPLETADA;
    // this.addDomainEvent(new RutaCompletadaEvent(this.id));
  }

  public cancelarRuta(): void {
    if (this.props.estado === EstadoRuta.COMPLETADA) {
      throw new EstadoInvalidoRutaException(this.props.estado, EstadoRuta.CANCELADA);
    }
    this.props.estado = EstadoRuta.CANCELADA;
    // this.addDomainEvent(new RutaCanceladaEvent(this.id));
  }
}
