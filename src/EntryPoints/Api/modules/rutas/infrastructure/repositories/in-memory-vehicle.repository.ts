import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '../../domain/ports/vehicle.repository';
import { Vehicle } from '../../domain/entities/vehicle.entity';

@Injectable()
export class InMemoryVehicleRepository implements VehicleRepository {
  private readonly vehicles: Map<string, Vehicle> = new Map();

  constructor() {
    // Seed with some data
    const vehicle1 = new Vehicle();
    vehicle1.id = 'VEH01';
    vehicle1.capacidadCarga = 1000; // 1000 kg
    vehicle1.capacidadVolumen = 10; // 10 m3

    const vehicle2 = new Vehicle();
    vehicle2.id = 'VEH02';
    vehicle2.capacidadCarga = 500; // 500 kg
    vehicle2.capacidadVolumen = 5; // 5 m3

    this.vehicles.set(vehicle1.id, vehicle1);
    this.vehicles.set(vehicle2.id, vehicle2);
  }

  async findById(id: string): Promise<Vehicle | null> {
    const vehicle = this.vehicles.get(id);
    return vehicle ? Promise.resolve(vehicle) : Promise.resolve(null);
  }
}
