
import {
  CrearRutaOptimaInput,
  CrearRutaOptimaOutput,
  CrearRutaOptimaUseCase,
} from "./CrearRutaOptimaUseCase";
import { RepositorioPaquetes } from "../../Domain/Ports/RepositorioPaquetes";
import { RepositorioVehiculos } from "../../Domain/Ports/RepositorioVehiculos";
import { RepositorioRutas } from "../../Domain/Ports/RepositorioRutas";
import { ServicioOptimizacionRutas } from "../../Domain/Services/ServicioOptimizacionRutas";
import { ServicioInformacionTrafico } from "../../Domain/Services/ServicioInformacionTrafico";
import { ServicioGeocodificacion } from "../../Domain/Services/ServicioGeocodificacion";
import { Paquete } from "../../Domain/Entities/Paquete";
import { Vehiculo } from "../../Domain/Entities/Vehiculo";
import { Ruta } from "../../Domain/Entities/Ruta";
import { PaqueteNoEncontradoException } from "../../Domain/Exceptions/PaqueteNoEncontradoException";
import { VehiculoNoEncontradoException } from "../../Domain/Exceptions/VehiculoNoEncontradoException";
import { CapacidadVehiculoExcedidaException } from "../../Domain/Exceptions/CapacidadVehiculoExcedidaException";
import { EstadoRuta } from "../../Domain/ValueObjects/EstadoRuta";
import { UniqueEntityID } from "../../../Shared/Domain/Entities/UniqueEntityID";
import { EstadoVehiculo } from "../../Domain/ValueObjects/EstadoVehiculo";
import { EstadoPaquete } from "../../Domain/ValueObjects/EstadoPaquete";
import { EstadoInvalidoPaqueteException } from "../../Domain/Exceptions/EstadoInvalidoPaqueteException";

// @Injectable() - Asumiendo un decorador para inyección de dependencias en un framework como NestJS
export class CrearRutaOptimaUseCaseImpl implements CrearRutaOptimaUseCase {
  constructor(
    private readonly repositorioPaquetes: RepositorioPaquetes,
    private readonly repositorioVehiculos: RepositorioVehiculos,
    private readonly repositorioRutas: RepositorioRutas,
    private readonly servicioOptimizacionRutas: ServicioOptimizacionRutas,
    private readonly servicioInformacionTrafico: ServicioInformacionTrafico,
    private readonly servicioGeocodificacion: ServicioGeocodificacion,
  ) {}

  async execute(input: CrearRutaOptimaInput): Promise<CrearRutaOptimaOutput> {
    // Validación de Entrada
    if (!input.paqueteIds || input.paqueteIds.length === 0) {
      throw new Error("La lista de paqueteIds no puede estar vacía.");
    }
    if (!input.vehiculoIds || input.vehiculoIds.length === 0) {
      throw new Error("La lista de vehiculoIds no puede estar vacía.");
    }

    // Recuperación de Entidades
    const paquetes = await Promise.all(
      input.paqueteIds.map(async (id) => {
        const paquete = await this.repositorioPaquetes.obtenerPorId(id);
        if (!paquete) {
          throw new PaqueteNoEncontradoException(`Paquete con ID ${id} no encontrado.`);
        }
        if (paquete.estado.getValue() !== "PENDIENTE") {
            throw new EstadoInvalidoPaqueteException(`El paquete ${id} no está en estado PENDIENTE.`);
        }
        return paquete;
      }),
    );

    const vehiculos = await Promise.all(
      input.vehiculoIds.map(async (id) => {
        const vehiculo = await this.repositorioVehiculos.obtenerPorId(id);
        if (!vehiculo) {
          throw new VehiculoNoEncontradoException(`Vehículo con ID ${id} no encontrado.`);
        }
        return vehiculo;
      }),
    );

    // Regla de Negocio (EX-01 - Capacidad del Vehículo)
    this.validarCapacidadVehiculos(paquetes, vehiculos);

    // Preparación para Optimización (Simplificado)
    // En una implementación real, aquí se obtendrían las condiciones de tráfico
    // const segmentos = this.generarSegmentosRuta(paquetes, vehiculos);
    // const condicionesTrafico = await this.servicioInformacionTrafico.obtenerCondicionesTraficoMultiples(segmentos);

    // Llamada al Servicio de Optimización
    const resultadoOptimizacion = await this.servicioOptimizacionRutas.calcularRutaOptima(
      paquetes,
      vehiculos,
    );

    // Creación y Persistencia de la Ruta
    const rutaOptima = resultadoOptimizacion.ruta;
    const vehiculoAsignado = resultadoOptimizacion.vehiculoAsignado;

    const rutaProps = {
      vehiculoId: vehiculoAsignado.id,
      paradas: rutaOptima.paradas,
      distanciaTotal: rutaOptima.distanciaTotal,
      duracionEstimada: rutaOptima.duracionEstimada,
      estado: EstadoRuta.create("PLANIFICADA").getValue(),
      fechaCreacion: new Date(),
    };
    const nuevaRuta = Ruta.create(rutaProps).getValue();
    await this.repositorioRutas.guardar(nuevaRuta);

    // Actualización de Paquetes y Vehículo
    await Promise.all(
      resultadoOptimizacion.paquetesAsignados.map(async (paquete) => {
        paquete.asignarARuta(nuevaRuta.id);
        await this.repositorioPaquetes.guardar(paquete);
      }),
    );

    vehiculoAsignado.actualizarEstado(EstadoVehiculo.create("PLANIFICADA").getValue());
    await this.repositorioVehiculos.guardar(vehiculoAsignado);

    // Construcción del Output
    const paquetesAsignadosIds = resultadoOptimizacion.paquetesAsignados.map((p) => p.id.toString());
    const todosLosPaquetesIds = paquetes.map((p) => p.id.toString());
    const paquetesNoAsignadosIds = todosLosPaquetesIds.filter(
      (id) => !paquetesAsignadosIds.includes(id),
    );

    return {
      rutaId: nuevaRuta.id.toString(),
      vehiculoId: vehiculoAsignado.id.toString(),
      paradas: nuevaRuta.paradas.map((parada) => ({
        paqueteId: parada.paqueteId.toString(),
        ubicacion: {
          latitud: parada.ubicacion.latitud,
          longitud: parada.ubicacion.longitud,
          direccion: parada.ubicacion.direccion,
        },
        tipo: parada.tipo,
        horaLlegadaEstimada: parada.horaLlegadaEstimada,
        horaSalidaEstimada: parada.horaSalidaEstimada,
      })),
      paquetesAsignados: paquetesAsignadosIds,
      paquetesNoAsignados: paquetesNoAsignadosIds.concat(resultadoOptimizacion.paquetesNoAsignadosPorRestriccion.map(p => p.id.toString())),
      distanciaTotal: nuevaRuta.distanciaTotal,
      duracionEstimada: nuevaRuta.duracionEstimada,
    };
  }

  private validarCapacidadVehiculos(paquetes: Paquete[], vehiculos: Vehiculo[]): void {
    const pesoTotalPaquetes = paquetes.reduce((sum, p) => sum + p.peso, 0);
    const volumenTotalPaquetes = paquetes.reduce((sum, p) => sum + p.volumen, 0);

    const algunVehiculoPuede = vehiculos.some(
      (v) =>
        v.capacidadMaximaPeso >= pesoTotalPaquetes &&
        v.capacidadMaximaVolumen >= volumenTotalPaquetes,
    );

    if (!algunVehiculoPuede) {
      throw new CapacidadVehiculoExcedidaException(
        "Ningún vehículo disponible tiene la capacidad suficiente para todos los paquetes.",
      );
    }
  }
}
