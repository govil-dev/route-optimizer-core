import { Package } from '../entities/package.entity';

export abstract class PackageRepository {
  abstract findByIds(ids: string[]): Promise<Package[]>;
  abstract findById(id: string): Promise<Package | null>;
}
