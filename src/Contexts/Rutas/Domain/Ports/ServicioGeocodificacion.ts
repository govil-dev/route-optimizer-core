
import { Ubicacion } from "../ValueObjects/Ubicacion";

export interface ServicioGeocodificacion {
  obtenerUbicacionPorDireccion(direccion: string): Promise<Ubicacion>;
}
