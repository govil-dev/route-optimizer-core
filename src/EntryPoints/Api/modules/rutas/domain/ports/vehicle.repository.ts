import { Vehicle } from '../entities/vehicle.entity';

export abstract class VehicleRepository {
  abstract findById(id: string): Promise<Vehicle | null>;
}
