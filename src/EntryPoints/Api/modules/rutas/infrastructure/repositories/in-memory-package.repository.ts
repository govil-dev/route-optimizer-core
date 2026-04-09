import { Injectable } from '@nestjs/common';
import { PackageRepository } from '../../domain/ports/package.repository';
import { Package } from '../../domain/entities/package.entity';
import { Location } from '../../domain/value-objects/location.vo';

@Injectable()
export class InMemoryPackageRepository implements PackageRepository {
  private readonly packages: Map<string, Package> = new Map();

  constructor() {
    // Seed with some data
    const pkg1 = new Package();
    pkg1.id = 'PKG001';
    pkg1.destino = new Location(-34.6037, -58.3816); // Buenos Aires
    pkg1.direccionDestino = 'Av. 9 de Julio, Buenos Aires';
    pkg1.peso = 5;
    pkg1.dimensiones = { alto: 20, ancho: 30, largo: 40 };

    const pkg2 = new Package();
    pkg2.id = 'PKG002';
    pkg2.destino = new Location(-34.6158, -58.4333); // Caballito, BA
    pkg2.direccionDestino = 'Av. Rivadavia 4900, Buenos Aires';
    pkg2.peso = 10;
    pkg2.dimensiones = { alto: 50, ancho: 50, largo: 50 };

    const pkg3 = new Package();
    pkg3.id = 'PKG003';
    pkg3.destino = new Location(-34.5889, -58.4302); // Palermo, BA
    pkg3.direccionDestino = 'Av. Santa Fe 3253, Buenos Aires';
    pkg3.peso = 2;
    pkg3.dimensiones = { alto: 10, ancho: 15, largo: 20 };

    this.packages.set(pkg1.id, pkg1);
    this.packages.set(pkg2.id, pkg2);
    this.packages.set(pkg3.id, pkg3);
  }

  async findById(id: string): Promise<Package | null> {
    const pkg = this.packages.get(id);
    return pkg ? Promise.resolve(pkg) : Promise.resolve(null);
  }

  async findByIds(ids: string[]): Promise<Package[]> {
    const foundPackages = ids
      .map((id) => this.packages.get(id))
      .filter((pkg) => pkg !== undefined) as Package[];
    return Promise.resolve(foundPackages);
  }
}
