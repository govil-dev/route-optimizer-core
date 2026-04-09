import { Test, TestingModule } from "@nestjs/testing";
import { MarcarEstadoEntregaPaqueteUseCaseImpl } from "../../../../../../../../src/EntryPoints/Api/modules/entrega-paquetes/application/use-cases/marcar-estado-entrega-paquete.use-case-impl";
import { MarcarEstadoEntregaPaqueteInput } from "../../../../../../../../src/EntryPoints/Api/modules/entrega-paquetes/application/dtos/marcar-estado-entrega-paquete.input";
import { MarcarEstadoEntregaPaqueteOutput } from "../../../../../../../../src/EntryPoints/Api/modules/entrega-paquetes/application/dtos/marcar-estado-entrega-paquete.output";
import { RepositorioPaquetes } from "../../../../../../../../src/Contexts/Rutas/Domain/Ports/RepositorioPaquetes";
import { IEventPublisher } from "../../../../../../../../src/EntryPoints/Api/modules/entrega-paquetes/domain/ports/event-publisher";
import { Paquete } from "../../../../../../../../src/Contexts/Rutas/Domain/Entities/Paquete";
import { PaqueteId } from "../../../../../../../../src/Contexts/Rutas/Domain/ValueObjects/PaqueteId";
import { Ubicacion } from "../../../../../../../../src/Contexts/Rutas/Domain/ValueObjects/Ubicacion";
import { EstadoPaquete } from "../../../../../../../../src/Contexts/Rutas/Domain/Enums/EstadoPaquete";
import {
  PaqueteNoEncontradoException,
  EstadoInvalidoPaqueteException,
} from "../../../../../../../../src/Contexts/Rutas/Domain/Exceptions/RutasExceptions"; // Assuming a consolidated exceptions file for Rutas context
import {
  GeofenceViolationException,
  MissingProofOfDeliveryException,
  MissingReasonCodeException,
} from "../../../../../../../../src/EntryPoints/Api/modules/entrega-paquetes/domain/exceptions"; // Assuming an index file for entrega-paquetes exceptions
import { PackageStatusChangedEvent } from "../../../../../../../../src/EntryPoints/Api/modules/entrega-paquetes/domain/events/package-status-changed.event";

// --- Mocks para dependencias y entidades de dominio ---

// Valores constantes para facilitar las pruebas
const MOCK_PACKAGE_ID_VALUE = "test-package-id-123";
const MOCK_DESTINATION_LAT = -34.6037; // Latitud de Buenos Aires (Obelisco)
const MOCK_DESTINATION_LON = -58.3816; // Longitud de Buenos Aires (Obelisco)

// Mock de la entidad Paquete para controlar su comportamiento en los tests
class MockPaquete extends Paquete {
  public id: PaqueteId;
  public estado: EstadoPaquete;
  public ubicacionDestino: Ubicacion;
  public pruebaDeEntrega: any;
  public codigoRazonFallo: string;

  constructor(
    id: string,
    estado: EstadoPaquete,
    latitudDestino: number,
    longitudDestino: number,
  ) {
    // Llamada al constructor de la clase base Paquete con valores dummy para las propiedades no relevantes para este mock
    super(
      new PaqueteId(id),
      new Ubicacion(0, 0), // Ubicación de origen dummy
      new Ubicacion(latitudDestino, longitudDestino), // Ubicación de destino real para el test
      1, // Peso dummy
      1, // Volumen dummy
      estado, // Estado inicial para el test
    );
    this.id = new PaqueteId(id);
    this.estado = estado;
    this.ubicacionDestino = new Ubicacion(latitudDestino, longitudDestino);
  }

  public obtenerEstado(): EstadoPaquete {
    return this.estado;
  }

  public marcarComoEntregado(pruebaDeEntrega: any): void {
    this.estado = EstadoPaquete.ENTREGADO;
    this.pruebaDeEntrega = pruebaDeEntrega;
  }

  public marcarComoFallido(codigoRazonFallo: string): void {
    this.estado = EstadoPaquete.FALLIDO;
    this.codigoRazonFallo = codigoRazonFallo;
  }
}

// Mock del RepositorioPaquetes
const mockRepositorioPaquetes: jest.Mocked<RepositorioPaquetes> = {
  obtenerPorId: jest.fn(),
  guardar: jest.fn(),
};

// Mock del Publicador de Eventos
const mockEventPublisher: jest.Mocked<IEventPublisher> = {
  publish: jest.fn(),
};

// --- Suite de Tests Unitarios ---
describe("MarcarEstadoEntregaPaqueteUseCaseImpl", () => {
  let useCase: MarcarEstadoEntregaPaqueteUseCaseImpl;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarcarEstadoEntregaPaqueteUseCaseImpl,
        {
          provide: "RepositorioPaquetes", // Token de inyección para RepositorioPaquetes
          useValue: mockRepositorioPaquetes,
        },
        {
          provide: "IEventPublisherToken", // Token de inyección para IEventPublisher
          useValue: mockEventPublisher,
        },
      ],
    }).compile();

    useCase = module.get<MarcarEstadoEntregaPaqueteUseCaseImpl>(
      MarcarEstadoEntregaPaqueteUseCaseImpl,
    );

    // Resetear los mocks antes de cada test para asegurar independencia
    mockRepositorioPaquetes.obtenerPorId.mockReset();
    mockRepositorioPaquetes.guardar.mockReset();
    mockEventPublisher.publish.mockReset();
  });

  // Helper para crear una ubicación ligeramente dentro de la geocerca (ej. 10 metros)
  const createLocationWithinGeofence = (baseLat: number, baseLon: number): Ubicacion => {
    // Aproximadamente 10 metros al norte (1 grado de latitud es ~111.139 km)
    const latOffset = 10 / 111139;
    return new Ubicacion(baseLat + latOffset, baseLon);
  };

  // Helper para crear una ubicación fuera de la geocerca (ej. 100 metros)
  const createLocationOutsideGeofence = (baseLat: number, baseLon: number): Ubicacion => {
    // Aproximadamente 100 metros al norte
    const latOffset = 100 / 111139;
    return new Ubicacion(baseLat + latOffset, baseLon);
  };

  // Caso de Éxito: Marcar como ENTREGADO
  it("debería marcar un paquete como ENTREGADO exitosamente cuando se cumplen todas las condiciones", async () => {
    const paqueteId = MOCK_PACKAGE_ID_VALUE;
    const mockPaquete = new MockPaquete(
      paqueteId,
      EstadoPaquete.EN_TRANSITO,
      MOCK_DESTINATION_LAT,
      MOCK_DESTINATION_LON,
    );
    mockRepositorioPaquetes.obtenerPorId.mockResolvedValue(mockPaquete);

    const input: MarcarEstadoEntregaPaqueteInput = {
      paqueteId: paqueteId,
      estadoEntrega: "ENTREGADO",
      ubicacionActual: createLocationWithinGeofence(
        MOCK_DESTINATION_LAT,
        MOCK_DESTINATION_LON,
      ),
      pruebaDeEntrega: { tipo: "FOTO", url: "http://example.com/proof.jpg" },
    };

    const result = await useCase.execute(input);

    expect(result).toBeDefined();
    expect(result.paqueteId).toBe(paqueteId);
    expect(result.nuevoEstado).toBe("ENTREGADO");
    expect(mockPaquete.obtenerEstado()).toBe(EstadoPaquete.ENTREGADO);
    expect(mockRepositorioPaquetes.guardar).toHaveBeenCalledWith(mockPaquete);
    expect(mockEventPublisher.publish).toHaveBeenCalledTimes(1);
    expect(mockEventPublisher.publish).toHaveBeenCalledWith(
      expect.any(PackageStatusChangedEvent), // Verifica que se publique un evento de este tipo
    );
    const publishedEvent = mockEventPublisher.publish.mock.calls[0][0];
    expect(publishedEvent.aggregateId).toBe(paqueteId);
    expect(publishedEvent.newStatus).toBe("ENTREGADO");
  });

  // Caso de Éxito: Marcar como FALLIDO
  it("debería marcar un paquete como FALLIDO exitosamente cuando se proporciona un código de razón", async () => {
    const paqueteId = MOCK_PACKAGE_ID_VALUE;
    const mockPaquete = new MockPaquete(
      paqueteId,
      EstadoPaquete.EN_TRANSITO,
      MOCK_DESTINATION_LAT,
      MOCK_DESTINATION_LON,
    );
    mockRepositorioPaquetes.obtenerPorId.mockResolvedValue(mockPaquete);

    const input: MarcarEstadoEntregaPaqueteInput = {
      paqueteId: paqueteId,
      estadoEntrega: "FALLIDO",
      ubicacionActual: new Ubicacion(MOCK_DESTINATION_LAT, MOCK_DESTINATION_LON), // La ubicación no es relevante para FALLIDO
      codigoRazonFallo: "CUSTOMER_NOT_HOME",
    };

    const result = await useCase.execute(input);

    expect(result).toBeDefined();
    expect(result.paqueteId).toBe(paqueteId);
    expect(result.nuevoEstado).toBe("FALLIDO");
    expect(mockPaquete.obtenerEstado()).toBe(EstadoPaquete.FALLIDO);
    expect(mockPaquete.codigoRazonFallo).toBe("CUSTOMER_NOT_HOME");
    expect(mockRepositorioPaquetes.guardar).toHaveBeenCalledWith(mockPaquete);
    expect(mockEventPublisher.publish).toHaveBeenCalledTimes(1);
    expect(mockEventPublisher.publish).toHaveBeenCalledWith(
      expect.any(PackageStatusChangedEvent),
    );
    const publishedEvent = mockEventPublisher.publish.mock.calls[0][0];
    expect(publishedEvent.aggregateId).toBe(paqueteId);
    expect(publishedEvent.newStatus).toBe("FALLIDO");
  });

  // Caso de Fallo: Paquete no encontrado
  it("debería lanzar PaqueteNoEncontradoException si el paquete no existe", async () => {
    mockRepositorioPaquetes.obtenerPorId.mockResolvedValue(null);

    const input: MarcarEstadoEntregaPaqueteInput = {
      paqueteId: "non-existent-id",
      estadoEntrega: "ENTREGADO",
      ubicacionActual: new Ubicacion(MOCK_DESTINATION_LAT, MOCK_DESTINATION_LON),
      pruebaDeEntrega: { tipo: "FOTO", url: "http://example.com/proof.jpg" },
    };

    await expect(useCase.execute(input)).rejects.toThrow(PaqueteNoEncontradoException);
    expect(mockRepositorioPaquetes.guardar).not.toHaveBeenCalled();
    expect(mockEventPublisher.publish).not.toHaveBeenCalled();
  });

  // Caso de Fallo: Estado inválido del paquete para ENTREGADO
  it("debería lanzar EstadoInvalidoPaqueteException si el paquete está en estado PENDIENTE para ENTREGADO", async () => {
    const paqueteId = MOCK_PACKAGE_ID_VALUE;
    const mockPaquete = new MockPaquete(
      paqueteId,
      EstadoPaquete.PENDIENTE,
      MOCK_DESTINATION_LAT,
      MOCK_DESTINATION_LON,
    );
    mockRepositorioPaquetes.obtenerPorId.mockResolvedValue(mockPaquete);

    const input: MarcarEstadoEntregaPaqueteInput = {
      paqueteId: paqueteId,
      estadoEntrega: "ENTREGADO",
      ubicacionActual: createLocationWithinGeofence(
        MOCK_DESTINATION_LAT,
        MOCK_DESTINATION_LON,
      ),
      pruebaDeEntrega: { tipo: "FOTO", url: "http://example.com/proof.jpg" },
    };

    await expect(useCase.execute(input)).rejects.toThrow(EstadoInvalidoPaqueteException);
    expect(mockRepositorioPaquetes.guardar).not.toHaveBeenCalled();
    expect(mockEventPublisher.publish).not.toHaveBeenCalled();
  });

  it("debería lanzar EstadoInvalidoPaqueteException si el paquete ya está ENTREGADO para ENTREGADO", async () => {
    const paqueteId = MOCK_PACKAGE_ID_VALUE;
    const mockPaquete = new MockPaquete(
      paqueteId,
      EstadoPaquete.ENTREGADO,
      MOCK_DESTINATION_LAT,
      MOCK_DESTINATION_LON,
    );
    mockRepositorioPaquetes.obtenerPorId.mockResolvedValue(mockPaquete);

    const input: MarcarEstadoEntregaPaqueteInput = {
      paqueteId: paqueteId,
      estadoEntrega: "ENTREGADO",
      ubicacionActual: createLocationWithinGeofence(
        MOCK_DESTINATION_LAT,
        MOCK_DESTINATION_LON,
      ),
      pruebaDeEntrega: { tipo: "FOTO", url: "http://example.com/proof.jpg" },
    };

    await expect(useCase.execute(input)).rejects.toThrow(EstadoInvalidoPaqueteException);
    expect(mockRepositorioPaquetes.guardar).not.toHaveBeenCalled();
    expect(mockEventPublisher.publish).not.toHaveBeenCalled();
  });

  // Caso de Fallo: Violación de Geocerca para ENTREGADO
  it("debería lanzar GeofenceViolationException si la ubicación actual está fuera de la geocerca de 50m para ENTREGADO", async () => {
    const paqueteId = MOCK_PACKAGE_ID_VALUE;
    const mockPaquete = new MockPaquete(
      paqueteId,
      EstadoPaquete.EN_TRANSITO,
      MOCK_DESTINATION_LAT,
      MOCK_DESTINATION_LON,
    );
    mockRepositorioPaquetes.obtenerPorId.mockResolvedValue(mockPaquete);

    const input: MarcarEstadoEntregaPaqueteInput = {
      paqueteId: paqueteId,
      estadoEntrega: "ENTREGADO",
      ubicacionActual: createLocationOutsideGeofence(
        MOCK_DESTINATION_LAT,
        MOCK_DESTINATION_LON,
      ), // 100m de distancia
      pruebaDeEntrega: { tipo: "FOTO", url: "http://example.com/proof.jpg" },
    };

    await expect(useCase.execute(input)).rejects.toThrow(GeofenceViolationException);
    expect(mockRepositorioPaquetes.guardar).not.toHaveBeenCalled();
    expect(mockEventPublisher.publish).not.toHaveBeenCalled();
  });

  // Caso de Fallo: Falta prueba de entrega para ENTREGADO
  it("debería lanzar MissingProofOfDeliveryException si no se proporciona prueba de entrega para ENTREGADO", async () => {
    const paqueteId = MOCK_PACKAGE_ID_VALUE;
    const mockPaquete = new MockPaquete(
      paqueteId,
      EstadoPaquete.EN_TRANSITO,
      MOCK_DESTINATION_LAT,
      MOCK_DESTINATION_LON,
    );
    mockRepositorioPaquetes.obtenerPorId.mockResolvedValue(mockPaquete);

    const input: MarcarEstadoEntregaPaqueteInput = {
      paqueteId: paqueteId,
      estadoEntrega: "ENTREGADO",
      ubicacionActual: createLocationWithinGeofence(
        MOCK_DESTINATION_LAT,
        MOCK_DESTINATION_LON,
      ),
      pruebaDeEntrega: undefined, // Falta la prueba de entrega
    };

    await expect(useCase.execute(input)).rejects.toThrow(MissingProofOfDeliveryException);
    expect(mockRepositorioPaquetes.guardar).not.toHaveBeenCalled();
    expect(mockEventPublisher.publish).not.toHaveBeenCalled();
  });

  // Caso de Fallo: Falta código de razón para FALLIDO
  it("debería lanzar MissingReasonCodeException si no se proporciona un código de razón para FALLIDO", async () => {
    const paqueteId = MOCK_PACKAGE_ID_VALUE;
    const mockPaquete = new MockPaquete(
      paqueteId,
      EstadoPaquete.EN_TRANSITO,
      MOCK_DESTINATION_LAT,
      MOCK_DESTINATION_LON,
    );
    mockRepositorioPaquetes.obtenerPorId.mockResolvedValue(mockPaquete);

    const input: MarcarEstadoEntregaPaqueteInput = {
      paqueteId: paqueteId,
      estadoEntrega: "FALLIDO",
      ubicacionActual: new Ubicacion(MOCK_DESTINATION_LAT, MOCK_DESTINATION_LON),
      codigoRazonFallo: undefined, // Falta el código de razón
    };

    await expect(useCase.execute(input)).rejects.toThrow(MissingReasonCodeException);
    expect(mockRepositorioPaquetes.guardar).not.toHaveBeenCalled();
    expect(mockEventPublisher.publish).not.toHaveBeenCalled();
  });
});
