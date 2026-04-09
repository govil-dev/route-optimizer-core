import { Stop } from './stop.entity';
import { v4 as uuidv4 } from 'uuid';

export class Route {
  readonly id: string;
  stops: Stop[];
  totalDistance: number; // en metros
  totalDuration: number; // en segundos

  constructor() {
    this.id = uuidv4();
  }
}
