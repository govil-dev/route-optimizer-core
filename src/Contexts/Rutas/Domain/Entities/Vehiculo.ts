import { Entity } from "../../../../Shared/Domain/Entity";
import { VehiculoId } from "../ValueObjects/VehiculoId";
import { Ubicacion } from "../ValueObjects/Ubicacion";
import { EstadoVehiculo } from "../Enums/EstadoVehiculo";
import { EstadoInvalidoVehiculoException } from "../Exceptions/EstadoInvalidoVehiculoException";

export class Vehiculo extends Entity<VehiculoId> {
    private placa: string;
    private capacidad: number; // en kg
    private ubicacionActual: Ubicacion;
    private estado: EstadoVehiculo;

    constructor(id: VehiculoId, placa: string, capacidad: number, ubicacionActual: Ubicacion) {
        super(id);
        this.placa = placa;
        this.capacidad = capacidad;
        this.ubicacionActual = ubicacionActual;
        this.estado = EstadoVehiculo.DISPONIBLE;
    }

    // --- Getters ---
    public getPlaca(): string {
        return this.placa;
    }

    public getCapacidad(): number {
        return this.capacidad;
    }

    public getUbicacionActual(): Ubicacion {
        return this.ubicacionActual;
    }

    public getEstado(): EstadoVehiculo {
        return this.estado;
    }

    // --- Lógica de Dominio ---
    public actualizarUbicacion(nuevaUbicacion: Ubicacion): void {
        this.ubicacionActual = nuevaUbicacion;
    }

    public marcarEnRuta(): void {
        if (this.estado !== EstadoVehiculo.DISPONIBLE) {
            throw new EstadoInvalidoVehiculoException(`No se puede poner en ruta un vehículo en estado '${this.estado}'`);
        }
        this.estado = EstadoVehiculo.EN_RUTA;
    }

    public marcarDisponible(): void {
        // Se podría añadir lógica para verificar si realmente puede pasar a disponible
        this.estado = EstadoVehiculo.DISPONIBLE;
    }

    public marcarMantenimiento(): void {
        if (this.estado === EstadoVehiculo.EN_RUTA) {
            throw new EstadoInvalidoVehiculoException("No se puede poner en mantenimiento un vehículo que está en ruta.");
        }
        this.estado = EstadoVehiculo.EN_MANTENIMIENTO;
    }

    public static create(id: VehiculoId, placa: string, capacidad: number, ubicacion: Ubicacion): Vehiculo {
        return new Vehiculo(id, placa, capacidad, ubicacion);
    }
}
