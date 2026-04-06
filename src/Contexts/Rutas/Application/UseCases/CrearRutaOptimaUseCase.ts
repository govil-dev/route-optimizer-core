
import { UseCase } from "../../../Shared/Application/UseCase";

// Asumiendo que estas interfaces existen para el Input y Output
export interface CrearRutaOptimaInput {
  paqueteIds: string[];
  vehiculoIds: string[];
}

export interface CrearRutaOptimaOutput {
  rutaId: string;
  vehiculoId: string;
  // NUEVAS PROPIEDADES REQUERIDAS POR EL CASO DE USO
  paradas: {
    paqueteId: string;
    ubicacion: { latitud: number; longitud: number; direccion?: string };
    tipo: "RECOGIDA" | "ENTREGA";
    horaLlegadaEstimada: Date;
    horaSalidaEstimada: Date;
  }[];
  paquetesNoAsignados: string[];
  // PROPIEDADES EXISTENTES
  paquetesAsignados: string[];
  distanciaTotal: number;
  duracionEstimada: number; // en segundos
}

export interface CrearRutaOptimaUseCase
  extends UseCase<CrearRutaOptimaInput, Promise<CrearRutaOptimaOutput>> {}
