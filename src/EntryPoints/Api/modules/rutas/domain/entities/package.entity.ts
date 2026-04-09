import { Location } from '../value-objects/location.vo';
import { TimeWindow } from '../value-objects/time-window.vo';

export class Package {
  id: string;
  destino: Location;
  dimensiones: { alto: number; ancho: number; largo: number }; // en cm
  peso: number; // en kg
  ventanaEntrega?: TimeWindow;
  direccionDestino: string;
}
