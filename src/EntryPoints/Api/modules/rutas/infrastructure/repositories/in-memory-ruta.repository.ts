import { Injectable } from "@nestjs/common";
import { Ruta } from "../../../../../../Contexts/Rutas/Domain/Aggregates/Ruta";
import { RepositorioRutas } from "../../../../../../Contexts/Rutas/Domain/Ports/RepositorioRutas";
import { RutaId } from "../../../../../../Contexts/Rutas/Domain/ValueObjects/RutaId";

@Injectable()
export class InMemoryRutaRepository implements RepositorioRutas {
    private readonly rutas: Map<string, Ruta> = new Map();

    async findById(id: RutaId): Promise<Ruta | null> {
        const ruta = this.rutas.get(id.getValue());
        return ruta ? Promise.resolve(ruta) : Promise.resolve(null);
    }

    async save(ruta: Ruta): Promise<void> {
        this.rutas.set(ruta.id.getValue(), ruta);
        return Promise.resolve();
    }

    async findAll(): Promise<Ruta[]> {
        return Promise.resolve(Array.from(this.rutas.values()));
    }

    // Helper for seeding data in tests or development
    seed(rutas: Ruta[]): void {
        rutas.forEach(r => this.rutas.set(r.id.getValue(), r));
    }

    clear(): void {
        this.rutas.clear();
    }
}
