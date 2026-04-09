import { Injectable } from '@nestjs/common';
import { RouteOptimizationService } from '../../domain/ports/route-optimization.service';
import { Vehicle } from '../../domain/entities/vehicle.entity';
import { Package } from '../../domain/entities/package.entity';
import { Route } from '../../domain/entities/route.entity';
import { Location } from '../../domain/value-objects/location.vo';
import { NoFeasibleRouteException } from '../../domain/exceptions/no-feasible-route.exception';
import { Stop } from '../../domain/entities/stop.entity';

// This is a mock implementation. A real implementation would call Google Maps API.
@Injectable()
export class GoogleMapsRouteOptimizationService
  implements RouteOptimizationService
{
  async calculateOptimalRoute(
    vehicle: Vehicle,
    packages: Package[],
    startLocation: Location,
    startTime: Date = new Date(),
  ): Promise<Route> {
    console.log('Simulating call to Google Maps Route Optimization API...');
    console.log('Vehicle:', vehicle.id);
    console.log('Packages:', packages.map((p) => p.id));
    console.log('Start Location:', startLocation.toString());
    console.log('Start Time:', startTime);

    // Mock logic: sort packages by distance from start point (naive approach)
    // A real implementation would use a complex algorithm or external API
    const sortedPackages = [...packages].sort((a, b) => {
      const distA = this.calculateDistance(startLocation, a.destino);
      const distB = this.calculateDistance(startLocation, b.destino);
      return distA - distB;
    });

    if (sortedPackages.length === 0) {
      throw new NoFeasibleRouteException('No packages to deliver.');
    }

    const route = new Route();
    route.stops = [];
    let currentTime = startTime.getTime();
    let currentLocation = startLocation;
    let totalDistance = 0;

    for (const pkg of sortedPackages) {
      const travelTime = this.calculateTravelTime(currentLocation, pkg.destino); // in seconds
      const distance = this.calculateDistance(currentLocation, pkg.destino); // in meters

      totalDistance += distance;
      currentTime += travelTime * 1000;
      const arrivalTime = new Date(currentTime);

      // Add service time (e.g., 5 minutes to deliver)
      const serviceTime = 5 * 60 * 1000; // 5 minutes in ms
      currentTime += serviceTime;
      const departureTime = new Date(currentTime);

      if (
        pkg.ventanaEntrega &&
        (arrivalTime > pkg.ventanaEntrega.fin ||
          departureTime < pkg.ventanaEntrega.inicio)
      ) {
        throw new NoFeasibleRouteException(
          `Cannot meet time window for package ${pkg.id}`,
        );
      }

      const stop = new Stop();
      stop.location = pkg.destino;
      stop.packagesToDeliver = [pkg];
      stop.estimatedArrivalTime = arrivalTime;
      stop.estimatedDepartureTime = departureTime;
      stop.address = pkg.direccionDestino;

      route.stops.push(stop);
      currentLocation = pkg.destino;
    }

    // Return to depot (optional, depends on requirements)
    const travelTimeToDepot = this.calculateTravelTime(
      currentLocation,
      startLocation,
    );
    const distanceToDepot = this.calculateDistance(
      currentLocation,
      startLocation,
    );
    totalDistance += distanceToDepot;
    currentTime += travelTimeToDepot * 1000;

    route.totalDistance = totalDistance;
    route.totalDuration = (currentTime - startTime.getTime()) / 1000;

    return route;
  }

  // Haversine formula to calculate distance between two lat/lon points
  private calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371e3; // metres
    const φ1 = (loc1.latitud * Math.PI) / 180;
    const φ2 = (loc2.latitud * Math.PI) / 180;
    const Δφ = ((loc2.latitud - loc1.latitud) * Math.PI) / 180;
    const Δλ = ((loc2.longitud - loc1.longitud) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
  }

  // Simple time calculation based on distance and average speed
  private calculateTravelTime(loc1: Location, loc2: Location): number {
    const distance = this.calculateDistance(loc1, loc2); // in meters
    const averageSpeed = 10; // m/s (36 km/h)
    return distance / averageSpeed; // in seconds
  }
}
