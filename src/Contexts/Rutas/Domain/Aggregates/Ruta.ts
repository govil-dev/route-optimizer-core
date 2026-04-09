import { AggregateRoot } from "../../../../Shared/Domain/AggregateRoot";
import { RutaId } from "../ValueObjects/RutaId";
import { Parada } from "../ValueObjects/Parada";
import { EstadoRuta } from "../Enums/EstadoRuta";
import { Vehiculo } from "../Entities/Vehiculo";
import { VehiculoId } from "../ValueObjects/VehiculoId";
import { EstadoVehiculo } from "../Enums/EstadoVehiculo";
import { RutaYaTieneVehiculoException } from "../Exceptions/RutaYaTieneVehiculoException";
import { EstadoInvalidoRutaException } from "../Exceptions/EstadoInvalidoRutaException";
import { EstadoInvalidoVehiculoException } from "../Exceptions/EstadoInvalidoVehiculoException";
import { CapacidadVehiculoExcedidaException } from "../Exceptions/CapacidadVehiculoExcedidaException";
import { Paquete } from "../Entities/Paquete";
import { PaqueteId } from "../ValueObjects/PaqueteId";
import { PaqueteNoEncontradoException } from "../Exceptions/PaqueteNoEncontradoException";
import { PaqueteYaAsignadoException } from "../Exceptions/PaqueteYaAsignadoException";

export class Ruta extends AggregateRoot<RutaId> {
    private paradas: Parada[];
    private paquetes: Paquete[];
    private estado: EstadoRuta;
    private vehiculoId?: VehiculoId;
    private fechaCreacion: Date;
    private fechaSalida?: Date;
    private fechaLlegada?: Date;

    constructor(id: RutaId, paradas: Parada[], paquetes: Paquete[] = []) {
        super(id);
        this.paradas = paradas;
        this.paquetes = paquetes;
        this.estado = EstadoRuta.PLANIFICADA;
        this.fechaCreacion = new Date();
    }

    // --- Getters ---
    public getParadas(): Parada[] {
        return this.paradas;
    }

    public getPaquetes(): Paquete[] {
        return this.paquetes;
    }

    public getEstado(): EstadoRuta {
        return this.estado;
    }

    public getVehiculoId(): VehiculoId | undefined {
        return this.vehiculoId;
    }

    // --- Lógica de Dominio ---

    public asignarVehiculo(vehiculo: Vehiculo): void {
        if (this.estado !== EstadoRuta.PLANIFICADA) {
            throw new EstadoInvalidoRutaException(`No se puede asignar un vehículo a una ruta en estado '${this.estado}'`);
        }
        if (this.vehiculoId) {
            throw new RutaYaTieneVehiculoException(`La ruta ${this.id.getValue()} ya tiene asignado el vehículo ${this.vehiculoId.getValue()}`);
        }
        if (vehiculo.getEstado() !== EstadoVehiculo.DISPONIBLE) {
            throw new EstadoInvalidoVehiculoException(`El vehículo ${vehiculo.id.getValue()} no está disponible`);
        }

        const pesoTotalPaquetes = this.paquetes.reduce((total, pkg) => total + pkg.getDimensiones().peso, 0);
        if (pesoTotalPaquetes > vehiculo.getCapacidad()) {
            throw new CapacidadVehiculoExcedidaException(`La capacidad del vehículo ${vehiculo.id.getValue()} (${vehiculo.getCapacidad()} kg) es menor que el peso total de los paquetes (${pesoTotalPaquetes} kg)`);
        }

        this.vehiculoId = vehiculo.id;
        this.estado = EstadoRuta.ASIGNADA;
        vehiculo.marcarEnRuta();
    }

    public agregarPaquete(paquete: Paquete): void {
        if (this.estado !== EstadoRuta.PLANIFICADA) {
            throw new EstadoInvalidoRutaException("Solo se pueden agregar paquetes a rutas en estado 'PLANIFICADA'");
        }
        if (this.paquetes.some(p => p.id.equals(paquete.id))) {
            throw new PaqueteYaAsignadoException(`El paquete ${paquete.id.getValue()} ya está en esta ruta.`);
        }
        this.paquetes.push(paquete);
    }

    public iniciarRuta(): void {
        if (this.estado !== EstadoRuta.ASIGNADA) {
            throw new EstadoInvalidoRutaException("La ruta debe estar en estado 'ASIGNADA' para poder iniciarla.");
        }
        if (!this.vehiculoId) {
            throw new EstadoInvalidoRutaException("No se puede iniciar una ruta sin un vehículo asignado.");
        }
        this.estado = EstadoRuta.EN_CURSO;
        this.fechaSalida = new Date();
        this.paquetes.forEach(p => p.marcarEnTransito());
    }

    public completarRuta(): void {
        if (this.estado !== EstadoRuta.EN_CURSO) {
            throw new EstadoInvalidoRutaException("Solo se pueden completar rutas que están 'EN_CURSO'.");
        }
        this.estado = EstadoRuta.COMPLETADA;
        this.fechaLlegada = new Date();
    }

    public cancelarRuta(): void {
        if (this.estado === EstadoRuta.COMPLETADA || this.estado === EstadoRuta.CANCELADA) {
            throw new EstadoInvalidoRutaException(`No se puede cancelar una ruta en estado '${this.estado}'.`);
        }
        this.estado = EstadoRuta.CANCELADA;
        this.paquetes.forEach(p => p.marcarPendiente());
    }

    public marcarPaqueteEntregado(paqueteId: PaqueteId): void {
        const paquete = this.findPaquete(paqueteId);
        paquete.marcarEntregado();
    }

    private findPaquete(paqueteId: PaqueteId): Paquete {
        const paquete = this.paquetes.find(p => p.id.equals(paqueteId));
        if (!paquete) {
            throw new PaqueteNoEncontradoException(`El paquete con ID ${paqueteId.getValue()} no se encuentra en esta ruta.`);
        }
        return paquete;
    }

    public static create(id: RutaId, paradas: Parada[], paquetes: Paquete[]): Ruta {
        return new Ruta(id, paradas, paquetes);
    }
}
