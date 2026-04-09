import { Location } from '../value-objects/location.vo';
import { Package } from './package.entity';

export class Stop {
  location: Location;
  packagesToDeliver: Package[];
  estimatedArrivalTime: Date;
  estimatedDepartureTime: Date;
  address: string;
}
