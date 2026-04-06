
import { Vehiculo } from "../Entities/Vehiculo";
import { VehiculoId } from "../ValueObjects/VehiculoId";

export interface RepositorioVehiculos {
  obtenerPorId(id: VehiculoId): Promise<Vehiculo | null>;
  guardar(vehiculo: Vehiculo): Promise<void>;
  obtenerVehiculosDisponibles(): Promise<Vehiculo[]>;
}
