
import { Ruta } from "../Aggregates/Ruta";
import { RutaId } from "../ValueObjects/RutaId";
import { VehiculoId } from "../ValueObjects/VehiculoId";

export interface RepositorioRutas {
  obtenerPorId(id: RutaId): Promise<Ruta | null>;
  guardar(ruta: Ruta): Promise<void>;
  obtenerRutasActivasPorVehiculo(vehiculoId: VehiculoId): Promise<Ruta[]>;
}
