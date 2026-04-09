// tests/Unit/EntryPoints/Api/modules/entrega-paquetes/application/use-cases/marcar-estado-entrega-paquete.use-case-impl.spec.ts

import { Test, TestingModule } from "@nestjs/testing";
import { MarcarEstadoEntregaPaqueteUseCaseImpl } from "../../../../../../../../src/EntryPoints/Api/modules/entrega-paquetes/application/use-cases/marcar-estado-entrega-paquete.use-case-impl";
import { MarcarEstadoEntregaPaqueteInput } from "../../../../../../../../src/EntryPoints/Api/modules/entrega-paquetes/application/dtos/marcar-estado-entrega-paquete.input";
import { RepositorioPaquetes } from "../../../../../../../../src/Contexts/Rutas/Domain/Ports/RepositorioPaquetes";
import { IEventPublisher, IEventPublisherToken } from "../../../../../../../../src/EntryPoints/Api/modules/entrega-paquetes/domain/ports/event-publisher";
import { Paquete } from "../../../../../../../../src/Contexts/Rutas/Domain/Entities/Paquete";
import { PaqueteId } from "../../../../../../../../src/Contexts/Rutas/Domain/ValueObjects/PaqueteId";
import { Ubicacion } from "../../../../../../../../src/Contexts/Rutas/Domain/ValueObjects/Ubicacion";
import { MissingProofOfDeliveryException } from "../../../../../../../../src/EntryPoints/Api/modules/entrega-paquetes/domain/exceptions/missing-proof-of-delivery.exception";
import { MissingReasonCodeException } from "../../../../../../../../src/EntryPoints/Api/modules/entrega-paquetes/domain/exceptions/missing-reason-code.exception";
import { GeofenceViolationException } from "../../../../../../../../src/EntryPoints/Api/modules/entrega-paquetes/domain/exceptions/geofence-violation.exception";
import { PaqueteNoEncontradoException } from "../../../../../../../../src/Contexts/Rutas/Domain/Exceptions/PaqueteNoEncontradoException";
import { EstadoInvalidoPaqueteException } from "../../../../../../../../src/Contexts/Rutas/Domain/Exceptions/EstadoInvalidoPaqueteException";
import { PackageStatusChangedEvent } from "../../../../../../../../src/EntryPoints/Api/modules/entrega-paquetes/domain/events/package-status-changed.event";
import { UniqueEntityID } from "../../../../../../../../src/Shared/Domain/UniqueEntityID";
import { Entity } from "../../../../../../../../src/Shared/Domain/Entity";

// Mock para PaqueteId (extiende la clase real para compatibilidad de tipos)
class MockPaqueteId extends PaqueteId {
    constructor(value: string) {
        super(value);
    }
    getValue(): string { return this.value; }
}

// Mock para Ubicacion (extiende la clase real para compatibilidad de tipos)
class MockUbicacion extends Ubicacion {
    constructor(latitud: number, longitud: number) {
        super(latitud, longitud);
    }
    // Sobrescribe el método distanciaA para controlarlo en los tests
    distanciaA = jest.fn((otraUbicacion: Ubicacion) => 0); // Valor por defecto para facilitar tests
}

// Mock para la entidad Paquete (extiende la clase real para compatibilidad de tipos)
// Se asume una estructura de constructor básica para Paquete que incluye id, origen, destino, peso, volumen, ventanaTiempo, estado
class MockPaquete extends Paquete {
    public id: MockPaqueteId;
    private _estado: string;
    private _ubicacionDestino: MockUbicacion;

    constructor(idValue: string, estadoInicial: string, destinoLat: number, destinoLong: number) {
        // Llama al constructor de la clase base con valores dummy o nulos si no son relevantes para el test
        super(
            new MockPaqueteId(idValue),
            new MockUbicacion(0, 0), // Origen dummy
            new MockUbicacion(destinoLat, destinoLong), // Destino real para el mock
            0, // Peso dummy
            0, // Volumen dummy
            null, // VentanaTiempo dummy
            estadoInicial as any // Estado inicial
        );
        this.id = new MockPaqueteId(idValue);
        this._estado = estadoInicial;
        this._ubicacionDestino = new MockUbicacion(destinoLat, destinoLong);
    }

    getEstado(): string {
        return this._estado;
    }

    getUbicacionDestino(): MockUbicacion {
        return this._ubicacionDestino;
    }

    // Mockea los métodos de cambio de estado para controlar su comportamiento
    marcarComoEntregado = jest.fn((pruebaDeEntrega: any) => {
        this._estado = "ENTREGADO";
    });

    marcarComoFallido = jest.fn((codigoRazonFallo: string) => {
        this._estado = "FALLIDO";
    });
}

describe("MarcarEstadoEntregaPaqueteUseCaseImpl", () => {
    let useCase: MarcarEstadoEntregaPaqueteUseCaseImpl;
    let mockRepositorioPaquetes: jest.Mocked<RepositorioPaquetes>;
    let mockEventPublisher: jest.Mocked<IEventPublisher>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MarcarEstadoEntregaPaqueteUseCaseImpl,
                {
                    provide: "RepositorioPaquetes",
                    useValue: {
                        obtenerPorId: jest.fn(),
                        guardar: jest.fn(),
                    },
                },
                {
                    provide: IEventPublisherToken,
                    useValue: {
                        publish: jest.fn(),
                    },
                },
            ],
        }).compile();

        useCase = module.get<MarcarEstadoEntregaPaqueteUseCaseImpl>(MarcarEstadoEntregaPaqueteUseCaseImpl);
        mockRepositorioPaquetes = module.get("RepositorioPaquetes");
        mockEventPublisher = module.get(IEventPublisherToken);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("debería marcar un paquete como ENTREGADO exitosamente cuando cumple las condiciones", async () => {
        const paqueteId = "paquete-123";
        const destinoLat = 10;
        const destinoLong = 20;
        const mockPaquete = new MockPaquete(paqueteId, "ASIGNADO", destinoLat, destinoLong);

        mockRepositorioPaquetes.obtenerPorId.mockResolvedValue(mockPaquete);
        // Asegura que distanciaA retorne un valor dentro de la geocerca (<= 50m)
        (mockPaquete.getUbicacionDestino().distanciaA as jest.Mock).mockReturnValue(10);

        const input: MarcarEstadoEntregaPaqueteInput = {
            paqueteId: paqueteId,
            estadoEntrega: "ENTREGADO",
            ubicacionActual: { latitud: 10.0001, longitud: 20.0001 },
            pruebaDeEntrega: { tipo: "FOTO", url: "http://foto.com/123" },
        };

        const result = await useCase.execute(input);

        expect(mockRepositorioPaquetes.obtenerPorId).toHaveBeenCalledWith(expect.any(PaqueteId));
        expect(mockPaquete.marcarComoEntregado).toHaveBeenCalledWith(input.pruebaDeEntrega);
        expect(mockRepositorioPaquetes.guardar).toHaveBeenCalledWith(mockPaquete);
        expect(mockEventPublisher.publish).toHaveBeenCalledWith(
            expect.any(PackageStatusChangedEvent)
        );
        expect(result.paqueteId).toBe(paqueteId);
        expect(result.nuevoEstado).toBe("ENTREGADO");
        expect(mockPaquete.getEstado()).toBe("ENTREGADO"); // Verifica el cambio de estado interno del mock
    });

    it("debería marcar un paquete como FALLIDO exitosamente cuando cumple las condiciones", async () => {
        const paqueteId = "paquete-456";
        const destinoLat = 30;
        const destinoLong = 40;
        const mockPaquete = new MockPaquete(paqueteId, "EN_TRANSITO", destinoLat, destinoLong);

        mockRepositorioPaquetes.obtenerPorId.mockResolvedValue(mockPaquete);

        const input: MarcarEstadoEntregaPaqueteInput = {
            paqueteId: paqueteId,
            estadoEntrega: "FALLIDO",
            ubicacionActual: { latitud: 30.1, longitud: 40.1 },
            codigoRazonFallo: "CUSTOMER_NOT_HOME",
        };

        const result = await useCase.execute(input);

        expect(mockRepositorioPaquetes.obtenerPorId).toHaveBeenCalledWith(expect.any(PaqueteId));
        expect(mockPaquete.marcarComoFallido).toHaveBeenCalledWith(input.codigoRazonFallo);
        expect(mockRepositorioPaquetes.guardar).toHaveBeenCalledWith(mockPaquete);
        expect(mockEventPublisher.publish).toHaveBeenCalledWith(
            expect.any(PackageStatusChangedEvent)
        );
        expect(result.paqueteId).toBe(paqueteId);
        expect(result.nuevoEstado).toBe("FALLIDO");
        expect(mockPaquete.getEstado()).toBe("FALLIDO"); // Verifica el cambio de estado interno del mock
    });

    it("debería lanzar PaqueteNoEncontradoException si el paquete no existe", async () => {
        mockRepositorioPaquetes.obtenerPorId.mockResolvedValue(null);

        const input: MarcarEstadoEntregaPaqueteInput = {
            paqueteId: "non-existent-package",
            estadoEntrega: "ENTREGADO",
            ubicacionActual: { latitud: 0, longitud: 0 },
            pruebaDeEntrega: { tipo: "FOTO", url: "http://foto.com/123" },
        };

        await expect(useCase.execute(input)).rejects.toThrow(PaqueteNoEncontradoException);
        expect(mockRepositorioPaquetes.obtenerPorId).toHaveBeenCalledWith(expect.any(PaqueteId));
        expect(mockRepositorioPaquetes.guardar).not.toHaveBeenCalled();
        expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    it("debería lanzar EstadoInvalidoPaqueteException si el paquete no está en estado ASIGNADO o EN_TRANSITO para ENTREGADO", async () => {
        const paqueteId = "paquete-123";
        const mockPaquete = new MockPaquete(paqueteId, "PENDIENTE", 10, 20); // Estado inválido

        mockRepositorioPaquetes.obtenerPorId.mockResolvedValue(mockPaquete);
        (mockPaquete.getUbicacionDestino().distanciaA as jest.Mock).mockReturnValue(10);

        const input: MarcarEstadoEntregaPaqueteInput = {
            paqueteId: paqueteId,
            estadoEntrega: "ENTREGADO",
            ubicacionActual: { latitud: 10.0001, longitud: 20.0001 },
            pruebaDeEntrega: { tipo: "FOTO", url: "http://foto.com/123" },
        };

        await expect(useCase.execute(input)).rejects.toThrow(EstadoInvalidoPaqueteException);
        expect(mockPaquete.marcarComoEntregado).not.toHaveBeenCalled();
        expect(mockRepositorioPaquetes.guardar).not.toHaveBeenCalled();
        expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    it("debería lanzar EstadoInvalidoPaqueteException si el paquete no está en estado ASIGNADO o EN_TRANSITO para FALLIDO", async () => {
        const paqueteId = "paquete-456";
        const mockPaquete = new MockPaquete(paqueteId, "ENTREGADO", 30, 40); // Estado inválido

        mockRepositorioPaquetes.obtenerPorId.mockResolvedValue(mockPaquete);

        const input: MarcarEstadoEntregaPaqueteInput = {
            paqueteId: paqueteId,
            estadoEntrega: "FALLIDO",
            ubicacionActual: { latitud: 30.1, longitud: 40.1 },
            codigoRazonFallo: "CUSTOMER_NOT_HOME",
        };

        await expect(useCase.execute(input)).rejects.toThrow(EstadoInvalidoPaqueteException);
        expect(mockPaquete.marcarComoFallido).not.toHaveBeenCalled();
        expect(mockRepositorioPaquetes.guardar).not.toHaveBeenCalled();
        expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    it("debería lanzar GeofenceViolationException si la ubicación está fuera de la geocerca para ENTREGADO", async () => {
        const paqueteId = "paquete-123";
        const destinoLat = 10;
        const destinoLong = 20;
        const mockPaquete = new MockPaquete(paqueteId, "ASIGNADO", destinoLat, destinoLong);

        mockRepositorioPaquetes.obtenerPorId.mockResolvedValue(mockPaquete);
        // Simula distancia > 50m
        (mockPaquete.getUbicacionDestino().distanciaA as jest.Mock).mockReturnValue(100);

        const input: MarcarEstadoEntregaPaqueteInput = {
            paqueteId: paqueteId,
            estadoEntrega: "ENTREGADO",
            ubicacionActual: { latitud: 10.5, longitud: 20.5 }, // Lejos del destino
            pruebaDeEntrega: { tipo: "FOTO", url: "http://foto.com/123" },
        };

        await expect(useCase.execute(input)).rejects.toThrow(GeofenceViolationException);
        expect(mockPaquete.marcarComoEntregado).not.toHaveBeenCalled();
        expect(mockRepositorioPaquetes.guardar).not.toHaveBeenCalled();
        expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    it("debería lanzar MissingProofOfDeliveryException si falta la prueba de entrega para ENTREGADO", async () => {
        const paqueteId = "paquete-123";
        const destinoLat = 10;
        const destinoLong = 20;
        const mockPaquete = new MockPaquete(paqueteId, "ASIGNADO", destinoLat, destinoLong);

        mockRepositorioPaquetes.obtenerPorId.mockResolvedValue(mockPaquete);
        (mockPaquete.getUbicacionDestino().distanciaA as jest.Mock).mockReturnValue(10);

        const input: MarcarEstadoEntregaPaqueteInput = {
            paqueteId: paqueteId,
            estadoEntrega: "ENTREGADO",
            ubicacionActual: { latitud: 10.0001, longitud: 20.0001 },
            pruebaDeEntrega: undefined, // Prueba de entrega faltante
        };

        await expect(useCase.execute(input)).rejects.toThrow(MissingProofOfDeliveryException);
        expect(mockPaquete.marcarComoEntregado).not.toHaveBeenCalled();
        expect(mockRepositorioPaquetes.guardar).not.toHaveBeenCalled();
        expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    it("debería lanzar MissingReasonCodeException si falta el código de razón para FALLIDO", async () => {
        const paqueteId = "paquete-456";
        const destinoLat = 30;
        const destinoLong = 40;
        const mockPaquete = new MockPaquete(paqueteId, "EN_TRANSITO", destinoLat, destinoLong);

        mockRepositorioPaquetes.obtenerPorId.mockResolvedValue(mockPaquete);

        const input: MarcarEstadoEntregaPaqueteInput = {
            paqueteId: paqueteId,
            estadoEntrega: "FALLIDO",
            ubicacionActual: { latitud: 30.1, longitud: 40.1 },
            codigoRazonFallo: undefined, // Código de razón faltante
        };

        await expect(useCase.execute(input)).rejects.toThrow(MissingReasonCodeException);
        expect(mockPaquete.marcarComoFallido).not.toHaveBeenCalled();
        expect(mockRepositorioPaquetes.guardar).not.toHaveBeenCalled();
        expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });
});
