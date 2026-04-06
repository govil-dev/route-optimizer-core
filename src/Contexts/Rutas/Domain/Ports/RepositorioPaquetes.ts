
import { Paquete } from "../Entities/Paquete";
import { PaqueteId } from "../ValueObjects/PaqueteId";
import { RutaId } from "../ValueObjects/RutaId";

export interface RepositorioPaquetes {
  obtenerPorId(id: PaqueteId): Promise<Paquete | null>;
  guardar(paquete: Paquete): Promise<void>;
  obtenerPaquetesPendientes(): Promise<Paquete[]>;
  obtenerPaquetesAsignadosARuta(rutaId: RutaId): Promise<Paquete[]>;
}
