import { Module } from '@nestjs/common';
import { RutasController } from './infrastructure/controllers/rutas.controller';
import { CrearRutaOptimaUseCaseImpl } from '../../../../Contexts/Rutas/Application/UseCases/CrearRutaOptimaUseCaseImpl';
import { AsignarVehiculoARutaUseCaseImpl } from '../../../../Contexts/Rutas/Application/UseCases/AsignarVehiculoARutaUseCaseImpl';
import { InMemoryVehicleRepository } from './infrastructure/repositories/in-memory-vehicle.repository';
import { InMemoryPackageRepository } from './infrastructure/repositories/in-memory-package.repository';
import { GoogleMapsRouteOptimizationService } from './infrastructure/services/google-maps-route-optimization.service';
import { RepositorioRutas } from '../../../../Contexts/Rutas/Domain/Ports/RepositorioRutas';
import { InMemoryRutaRepository } from './infrastructure/repositories/in-memory-ruta.repository';

@Module({
  controllers: [RutasController],
  providers: [
    {
      provide: 'CrearRutaOptimaUseCase',
      useClass: CrearRutaOptimaUseCaseImpl,
    },
    {
      provide: 'AsignarVehiculoARutaUseCase',
      useClass: AsignarVehiculoARutaUseCaseImpl,
    },
    {
      provide: 'RepositorioVehiculos',
      useClass: InMemoryVehicleRepository,
    },
    {
      provide: 'RepositorioPaquetes',
      useClass: InMemoryPackageRepository,
    },
    {
      provide: 'ServicioOptimizacionRutas',
      useClass: GoogleMapsRouteOptimizationService,
    },
    {
      provide: 'RepositorioRutas',
      useClass: InMemoryRutaRepository,
    }
  ],
})
export class RutasModule {}
