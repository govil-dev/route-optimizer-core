import { Inject, Injectable } from '@nestjs/common';
import { CalcularRutaOptimaUseCase } from './calcular-ruta-optima.use-case';
import { CalcularRutaOptimaInput } from '../dtos/calcular-ruta-optima.input';
import { CalcularRutaOptimaOutput } from '../dtos/calcular-ruta-optima.output';
import { VehicleRepository } from '../../domain/ports/vehicle.repository';
import { PackageRepository } from '../../domain/ports/package.repository';
import { RouteOptimizationService } from '../../domain/ports/route-optimization.service';
import { Location } from '../../domain/value-objects/location.vo';
import { NoFeasibleRouteException } from '../../domain/exceptions/no-feasible-route.exception';

@Injectable()
export class CalcularRutaOptimaUseCaseImpl implements CalcularRutaOptimaUseCase {
  constructor(
    @Inject(VehicleRepository)
    private readonly vehicleRepository: VehicleRepository,
    @Inject(PackageRepository)
    private readonly packageRepository: PackageRepository,
    @Inject(RouteOptimizationService)
    private readonly routeOptimizationService: RouteOptimizationService,
  ) {}

  async execute(
    input: CalcularRutaOptimaInput,
  ): Promise<CalcularRutaOptimaOutput> {
    const vehicle = await this.vehicleRepository.findById(input.vehiculoId);
    if (!vehicle) {
      throw new Error('Vehículo no encontrado');
    }

    const packages = await this.packageRepository.findByIds(input.paqueteIds);
    if (packages.length !== input.paqueteIds.length) {
      throw new Error('Uno o más paquetes no fueron encontrados');
    }

    const totalWeight = packages.reduce((sum, p) => sum + p.peso, 0);
    if (totalWeight > vehicle.capacidadCarga) {
      throw new NoFeasibleRouteException(
        'La carga total excede la capacidad del vehículo.',
      );
    }

    const totalVolume = packages.reduce(
      (sum, p) =>
        sum + (p.dimensiones.alto * p.dimensiones.ancho * p.dimensiones.largo) / 1_000_000, // cm3 a m3
      0,
    );
    if (totalVolume > vehicle.capacidadVolumen) {
      throw new NoFeasibleRouteException(
        'El volumen total excede la capacidad del vehículo.',
      );
    }

    const startLocation = new Location(
      input.puntoPartida.latitud,
      input.puntoPartida.longitud,
    );

    const route = await this.routeOptimizationService.calculateOptimalRoute(
      vehicle,
      packages,
      startLocation,
      input.horaPartida,
    );

    return {
      rutaId: route.id,
      distanciaTotal: route.totalDistance,
      duracionTotal: route.totalDuration,
      paradas: route.stops.map((stop) => ({
        paqueteId: stop.packagesToDeliver[0].id, // Asumiendo una parada por paquete por simplicidad
        direccion: stop.address,
        horaEstimadaLlegada: stop.estimatedArrivalTime,
        horaEstimadaSalida: stop.estimatedDepartureTime,
      })),
    };
  }
}
