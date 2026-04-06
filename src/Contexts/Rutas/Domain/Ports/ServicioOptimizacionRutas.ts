
import { Paquete } from "../Entities/Paquete";
import { Vehiculo } from "../Entities/Vehiculo";
import { Ruta } from "../Aggregates/Ruta";

// DTO o Value Object que representa el resultado de la optimización
export interface RutaPlanificada {
    ruta: Ruta;
    paquetesAsignados: Paquete[];
}

export interface ServicioOptimizacionRutas {
  calcularRutaOptima(paquetes: Paquete[], vehiculos: Vehiculo[]): Promise<RutaPlanificada>;
}
