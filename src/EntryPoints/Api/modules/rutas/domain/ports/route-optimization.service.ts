import { Vehicle } from '../entities/vehicle.entity';
import { Package } from '../entities/package.entity';
import { Route } from '../entities/route.entity';
import { Location } from '../value-objects/location.vo';

export abstract class RouteOptimizationService {
  abstract calculateOptimalRoute(
    vehicle: Vehicle,
    packages: Package[],
    startLocation: Location,
    startTime?: Date,
  ): Promise<Route>;
}
