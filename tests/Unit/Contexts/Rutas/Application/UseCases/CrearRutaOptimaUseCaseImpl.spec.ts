import { CrearRutaOptimaUseCaseImpl } from '../../../../../src/Contexts/Rutas/Application/UseCases/CrearRutaOptimaUseCaseImpl';
import { CrearRutaOptimaInput, CrearRutaOptimaOutput } from '../../../../../src/Contexts/Rutas/Application/UseCases/CrearRutaOptimaUseCase';
import { RepositorioPaquetes } from '../../../../../src/Contexts/Rutas/Domain/Ports/RepositorioPaquetes';
import { RepositorioVehiculos } from '../../../../../src/Contexts/Rutas/Domain/Ports/RepositorioVehiculos';
import { RepositorioRutas } from '../../../../../src/Contexts/Rutas/Domain/Ports/RepositorioRutas';
import { ServicioOptimizacionRutas, RutaPlanificada } from '../../../../../src/Contexts/Rutas/Domain/Ports/ServicioOptimizacionRutas';
import { ServicioInformacionTrafico } from '../../../../../src/Contexts/Rutas/Domain/Ports/ServicioInformacionTrafico';
import { ServicioGeocodificacion } from '../../../../../src/Contexts/Rutas/Domain/Ports/ServicioGeocodificacion';
import { Paquete } from '../../../../../src/Contexts/Rutas/Domain/Entities/Paquete';
import { Vehiculo } from '../../../../../src/Contexts/Rutas/Domain/Entities/Vehiculo';
import { Ruta } from '../../../../../src/Contexts/Rutas/Domain/Aggregates/Ruta';
import { PaqueteNoEncontradoException } from '../../../../../src/Contexts/Rutas/Domain/Exceptions/PaqueteNoEncontradoException';
import { VehiculoNoEncontradoException } from '../../../../../src/Contexts/Rutas/Domain/Exceptions/VehiculoNoEncontradoException';
import { CapacidadVehiculoExcedidaException } from '../../../../../src/Contexts/Rutas/Domain/Exceptions/CapacidadVehiculoExcedidaException';
import { EstadoInvalidoPaqueteException } from '../../../../../src/Contexts/Rutas/Domain/Exceptions/EstadoInvalidoPaqueteException';
import { NoHayRutaFactibleException } from '../../../../../src/Contexts/Rutas/Domain/Exceptions/NoHayRutaFactibleException';
import { UniqueEntityID } from '../../../../../src/Shared/Domain/UniqueEntityID';
import { Ubicacion } from '../../../../../src/Contexts/Rutas/Domain/ValueObjects/Ubicacion';
import { EstadoPaquete } from '../../../../../src/Contexts/Rutas/Domain/Enums/EstadoPaquete';
import { EstadoVehiculo } from '../../../../../src/Contexts/Rutas/Domain/Enums/EstadoVehiculo';
import { EstadoRuta } from '../../../../../src/Contexts/Rutas/Domain/Enums/EstadoRuta';
import { Distancia } from '../../../../../src/Contexts/Rutas/Domain/ValueObjects/Distancia';
import { Duracion } from '../../../../../src/Contexts/Rutas/Domain/ValueObjects/Duracion';
import { Parada } from '../../../../../src/Contexts/Rutas/Domain/ValueObjects/Parada';
import { PaqueteId } from '../../../../../src/Contexts/Rutas/Domain/ValueObjects/PaqueteId';
import { VehiculoId } from '../../../../../src/Contexts/Rutas/Domain/ValueObjects/VehiculoId';
import { RutaId } from '../../../../../src/Contexts/Rutas/Domain/ValueObjects/RutaId';
import { VentanaTiempo } from '../../../../../src/Contexts/Rutas/Domain/ValueObjects/VentanaTiempo';
import { Result } from '../../../../../src/Shared/Domain/Result';


describe('CrearRutaOptimaUseCaseImpl', () => {
  let useCase: CrearRutaOptimaUseCaseImpl;
  let mockRepositorioPaquetes: jest.Mocked<RepositorioPaquetes>;
  let mockRepositorioVehiculos: jest.Mocked<RepositorioVehiculos>;
  let mockRepositorioRutas: jest.Mocked<RepositorioRutas>;
  let mockServicioOptimizacionRutas: jest.Mocked<ServicioOptimizacionRutas>;
  let mockServicioInformacionTrafico: jest.Mocked<ServicioInformacionTrafico>;
  let mockServicioGeocodificacion: jest.Mocked<ServicioGeocodificacion>;

  // Helper para crear Ubicacion
  const createUbicacion = (lat: number, long: number, dir?: string) => Ubicacion.create({ latitud: lat, longitud: long, direccion: dir }).getValue();

  // Helper para crear Paquete
  const createPaquete = (id: string, peso: number, volumen: number, estado: EstadoPaquete = EstadoPaquete.PENDIENTE, perecedero: boolean = false): Paquete => {
    const paqueteId = new UniqueEntityID(id);
    const origen = createUbicacion(1, 1, 'Origen A');
    const destino = createUbicacion(2, 2, 'Destino B');
    const ventanaTiempoEntrega = VentanaTiempo.create({ inicio: new Date(), fin: new Date(Date.now() + 3600000) }).getValue();
    return Paquete.create({
      descripcion: `Paquete ${id}`,
      peso,
      volumen,
      origen,
      destino,
      ventanaTiempoEntrega,
      perecedero,
    }, paqueteId).getValue();
  };

  // Helper para crear Vehiculo
  const createVehiculo = (id: string, peso: number, volumen: number, estado: EstadoVehiculo = EstadoVehiculo.DISPONIBLE): Vehiculo => {
    const vehiculoId = new UniqueEntityID(id);
    const ubicacionActual = createUbicacion(0, 0, 'Base');
    return Vehiculo.create({
      matricula: `ABC-${id}`,
      capacidadMaximaPeso: peso,
      capacidadMaximaVolumen: volumen,
      ubicacionActual,
      estado: EstadoVehiculo.create(estado).getValue(),
    }, vehiculoId);
  };

  // Helper para crear Ruta (simplificado para mocks)
  const createRuta = (id: string, vehiculoId: UniqueEntityID, paradas: Parada[] = []): Ruta => {
    const rutaId = new UniqueEntityID(id);
    const distanciaTotal = Distancia.create({ valor: 100, unidad: 'km' }).getValue();
    const duracionEstimada = Duracion.create({ valor: 3600, unidad: 'segundos' }).getValue();
    return Ruta.create({
      vehiculoId: VehiculoId.create(vehiculoId.toString()).getValue(),
      paradas,
      horaInicioEstimada: new Date(),
      horaFinEstimada: new Date(Date.now() + duracionEstimada.valor * 1000),
      distanciaTotalEstimada: distanciaTotal,
      duracionTotalEstimada: duracionEstimada,
      estado: EstadoRuta.create(EstadoRuta.PLANIFICADA).getValue(),
    }, rutaId);
  };

  // Helper para crear Parada
  const createParada = (paqueteId: string, lat: number, long: number, tipo: "RECOGIDA" | "ENTREGA"): Parada => {
    const ubicacion = createUbicacion(lat, long);
    return Parada.create({
      paqueteId: PaqueteId.create(paqueteId).getValue(),
      ubicacion,
      tipo,
      horaLlegadaEstimada: new Date(),
      horaSalidaEstimada: new Date(),
    }).getValue();
  };


  beforeEach(() => {
    mockRepositorioPaquetes = {
      obtenerPorId: jest.fn(),
      guardar: jest.fn(),
      obtenerPaquetesPendientes: jest.fn(),
      obtenerPaquetesAsignadosARuta: jest.fn(),
    };
    mockRepositorioVehiculos = {
      obtenerPorId: jest.fn(),
      guardar: jest.fn(),
      obtenerVehiculosDisponibles: jest.fn(),
    };
    mockRepositorioRutas = {
      obtenerPorId: jest.fn(),
      guardar: jest.fn(),
      obtenerRutasActivasPorVehiculo: jest.fn(),
    };
    mockServicioOptimizacionRutas = {
      calcularRutaOptima: jest.fn(),
    };
    mockServicioInformacionTrafico = {
      obtenerCondicionTrafico: jest.fn(),
      obtenerCondicionesTraficoMultiples: jest.fn(),
    };
    mockServicioGeocodificacion = {
      obtenerUbicacionPorDireccion: jest.fn(),
    };

    useCase = new CrearRutaOptimaUseCaseImpl(
      mockRepositorioPaquetes,
      mockRepositorioVehiculos,
      mockRepositorioRutas,
      mockServicioOptimizacionRutas,
      mockServicioInformacionTrafico,
      mockServicioGeocodificacion
    );
  });

  // --- Test Cases ---

  it('should successfully create an optimal route and assign packages/vehicle', async () => {
    const paquete1 = createPaquete('p1', 10, 1);
    const paquete2 = createPaquete('p2', 5, 0.5);
    const vehiculo1 = createVehiculo('v1', 20, 2);

    mockRepositorioPaquetes.obtenerPorId.mockResolvedValueOnce(paquete1);
    mockRepositorioPaquetes.obtenerPorId.mockResolvedValueOnce(paquete2);
    mockRepositorioVehiculos.obtenerPorId.mockResolvedValueOnce(vehiculo1);

    const paradasOptimas = [
      createParada('p1', 10, 10, 'RECOGIDA'),
      createParada('p2', 20, 20, 'ENTREGA'),
    ];
    const rutaOptimaMock = createRuta('r1', vehiculo1.id, paradasOptimas);

    mockServicioOptimizacionRutas.calcularRutaOptima.mockResolvedValueOnce({
      ruta: rutaOptimaMock,
      vehiculoAsignado: vehiculo1,
      paquetesAsignados: [paquete1, paquete2],
      paquetesNoAsignadosPorRestriccion: [],
    } as any); // Cast to any because the interface is slightly different in the mock

    const input: CrearRutaOptimaInput = {
      paqueteIds: ['p1', 'p2'],
      vehiculoIds: ['v1'],
    };

    const output = await useCase.execute(input);

    expect(mockRepositorioPaquetes.obtenerPorId).toHaveBeenCalledWith(expect.any(UniqueEntityID));
    expect(mockRepositorioVehiculos.obtenerPorId).toHaveBeenCalledWith(expect.any(UniqueEntityID));
    expect(mockServicioOptimizacionRutas.calcularRutaOptima).toHaveBeenCalledWith(
      [paquete1, paquete2],
      [vehiculo1]
    );
    expect(mockRepositorioRutas.guardar).toHaveBeenCalledTimes(1);
    expect(mockRepositorioRutas.guardar).toHaveBeenCalledWith(expect.objectContaining({
      props: expect.objectContaining({
        estado: EstadoRuta.create(EstadoRuta.PLANIFICADA).getValue(),
        vehiculoId: VehiculoId.create(vehiculo1.id.toString()).getValue(),
      }),
    }));
    expect(mockRepositorioPaquetes.guardar).toHaveBeenCalledTimes(2);
    expect(mockRepositorioPaquetes.guardar).toHaveBeenCalledWith(expect.objectContaining({
      props: expect.objectContaining({
        estado: EstadoPaquete.create(EstadoPaquete.ASIGNADO).getValue(),
        rutaAsignadaId: expect.any(UniqueEntityID),
      }),
    }));
    expect(mockRepositorioVehiculos.guardar).toHaveBeenCalledTimes(1);
    expect(mockRepositorioVehiculos.guardar).toHaveBeenCalledWith(expect.objectContaining({
      props: expect.objectContaining({
        estado: EstadoVehiculo.create(EstadoVehiculo.PLANIFICADA).getValue(),
      }),
    }));

    expect(output).toEqual(expect.objectContaining({
      rutaId: rutaOptimaMock.id.toString(),
      vehiculoId: vehiculo1.id.toString(),
      paradas: expect.arrayContaining([
        expect.objectContaining({ paqueteId: 'p1' }),
        expect.objectContaining({ paqueteId: 'p2' }),
      ]),
      paquetesAsignados: ['p1', 'p2'],
      paquetesNoAsignados: [],
      distanciaTotal: rutaOptimaMock.props.distanciaTotalEstimada.valor,
      duracionEstimada: rutaOptimaMock.props.duracionTotalEstimada.valor,
    }));
  });

  it('should throw an error if paqueteIds is empty', async () => {
    const input: CrearRutaOptimaInput = {
      paqueteIds: [],
      vehiculoIds: ['v1'],
    };

    await expect(useCase.execute(input)).rejects.toThrow('La lista de paqueteIds no puede estar vacía.');
  });

  it('should throw an error if vehiculoIds is empty', async () => {
    const input: CrearRutaOptimaInput = {
      paqueteIds: ['p1'],
      vehiculoIds: [],
    };

    await expect(useCase.execute(input)).rejects.toThrow('La lista de vehiculoIds no puede estar vacía.');
  });

  it('should throw PaqueteNoEncontradoException if a package is not found', async () => {
    const paquete1 = createPaquete('p1', 10, 1);
    mockRepositorioPaquetes.obtenerPorId.mockResolvedValueOnce(paquete1); // p1 found
    mockRepositorioPaquetes.obtenerPorId.mockResolvedValueOnce(null); // p2 not found

    const input: CrearRutaOptimaInput = {
      paqueteIds: ['p1', 'p2'],
      vehiculoIds: ['v1'],
    };

    await expect(useCase.execute(input)).rejects.toThrow(PaqueteNoEncontradoException);
    expect(mockRepositorioPaquetes.obtenerPorId).toHaveBeenCalledWith(expect.any(UniqueEntityID));
  });

  it('should throw VehiculoNoEncontradoException if a vehicle is not found', async () => {
    const paquete1 = createPaquete('p1', 10, 1);
    const vehiculo1 = createVehiculo('v1', 20, 2);

    mockRepositorioPaquetes.obtenerPorId.mockResolvedValueOnce(paquete1);
    mockRepositorioVehiculos.obtenerPorId.mockResolvedValueOnce(vehiculo1); // v1 found
    mockRepositorioVehiculos.obtenerPorId.mockResolvedValueOnce(null); // v2 not found

    const input: CrearRutaOptimaInput = {
      paqueteIds: ['p1'],
      vehiculoIds: ['v1', 'v2'],
    };

    await expect(useCase.execute(input)).rejects.toThrow(VehiculoNoEncontradoException);
    expect(mockRepositorioVehiculos.obtenerPorId).toHaveBeenCalledWith(expect.any(UniqueEntityID));
  });

  it('should throw EstadoInvalidoPaqueteException if a package is not in PENDIENTE state', async () => {
    const paquete1 = createPaquete('p1', 10, 1, EstadoPaquete.ASIGNADO); // Not PENDIENTE
    const vehiculo1 = createVehiculo('v1', 20, 2);

    mockRepositorioPaquetes.obtenerPorId.mockResolvedValueOnce(paquete1);
    mockRepositorioVehiculos.obtenerPorId.mockResolvedValueOnce(vehiculo1);

    const input: CrearRutaOptimaInput = {
      paqueteIds: ['p1'],
      vehiculoIds: ['v1'],
    };

    await expect(useCase.execute(input)).rejects.toThrow(EstadoInvalidoPaqueteException);
    expect(mockRepositorioPaquetes.obtenerPorId).toHaveBeenCalledWith(expect.any(UniqueEntityID));
  });

  it('should throw CapacidadVehiculoExcedidaException if no vehicle can carry all packages', async () => {
    const paquete1 = createPaquete('p1', 100, 10); // Large package
    const vehiculo1 = createVehiculo('v1', 50, 5); // Small vehicle

    mockRepositorioPaquetes.obtenerPorId.mockResolvedValueOnce(paquete1);
    mockRepositorioVehiculos.obtenerPorId.mockResolvedValueOnce(vehiculo1);

    const input: CrearRutaOptimaInput = {
      paqueteIds: ['p1'],
      vehiculoIds: ['v1'],
    };

    await expect(useCase.execute(input)).rejects.toThrow(CapacidadVehiculoExcedidaException);
  });

  it('should re-throw NoHayRutaFactibleException from ServicioOptimizacionRutas', async () => {
    const paquete1 = createPaquete('p1', 10, 1);
    const vehiculo1 = createVehiculo('v1', 20, 2);

    mockRepositorioPaquetes.obtenerPorId.mockResolvedValueOnce(paquete1);
    mockRepositorioVehiculos.obtenerPorId.mockResolvedValueOnce(vehiculo1);

    mockServicioOptimizacionRutas.calcularRutaOptima.mockRejectedValueOnce(
      new NoHayRutaFactibleException('No se pudo encontrar una ruta factible.')
    );

    const input: CrearRutaOptimaInput = {
      paqueteIds: ['p1'],
      vehiculoIds: ['v1'],
    };

    await expect(useCase.execute(input)).rejects.toThrow(NoHayRutaFactibleException);
  });

  it('should return packages not assigned by optimizer in paquetesNoAsignados', async () => {
    const paquete1 = createPaquete('p1', 10, 1);
    const paquete2 = createPaquete('p2', 5, 0.5); // This one will be unassigned
    const vehiculo1 = createVehiculo('v1', 20, 2);

    mockRepositorioPaquetes.obtenerPorId.mockResolvedValueOnce(paquete1);
    mockRepositorioPaquetes.obtenerPorId.mockResolvedValueOnce(paquete2);
    mockRepositorioVehiculos.obtenerPorId.mockResolvedValueOnce(vehiculo1);

    const paradasOptimas = [
      createParada('p1', 10, 10, 'RECOGIDA'),
    ];
    const rutaOptimaMock = createRuta('r1', vehiculo1.id, paradasOptimas);

    mockServicioOptimizacionRutas.calcularRutaOptima.mockResolvedValueOnce({
      ruta: rutaOptimaMock,
      vehiculoAsignado: vehiculo1,
      paquetesAsignados: [paquete1], // Only p1 assigned
      paquetesNoAsignadosPorRestriccion: [paquete2], // p2 unassigned by optimizer
    } as any);

    const input: CrearRutaOptimaInput = {
      paqueteIds: ['p1', 'p2'],
      vehiculoIds: ['v1'],
    };

    const output = await useCase.execute(input);

    expect(output.paquetesAsignados).toEqual(['p1']);
    expect(output.paquetesNoAsignados).toEqual(['p2']);
    expect(mockRepositorioPaquetes.guardar).toHaveBeenCalledTimes(1); // Only for p1
  });

  it('should handle multiple vehicles and select one', async () => {
    const paquete1 = createPaquete('p1', 10, 1);
    const vehiculo1 = createVehiculo('v1', 20, 2);
    const vehiculo2 = createVehiculo('v2', 30, 3); // Another available vehicle

    mockRepositorioPaquetes.obtenerPorId.mockResolvedValueOnce(paquete1);
    mockRepositorioVehiculos.obtenerPorId.mockResolvedValueOnce(vehiculo1);
    mockRepositorioVehiculos.obtenerPorId.mockResolvedValueOnce(vehiculo2);

    const paradasOptimas = [
      createParada('p1', 10, 10, 'RECOGIDA'),
    ];
    const rutaOptimaMock = createRuta('r1', vehiculo2.id, paradasOptimas);

    mockServicioOptimizacionRutas.calcularRutaOptima.mockResolvedValueOnce({
      ruta: rutaOptimaMock,
      vehiculoAsignado: vehiculo2, // Optimizer returns vehiculo2
      paquetesAsignados: [paquete1],
      paquetesNoAsignadosPorRestriccion: [],
    } as any);

    const input: CrearRutaOptimaInput = {
      paqueteIds: ['p1'],
      vehiculoIds: ['v1', 'v2'],
    };

    const output = await useCase.execute(input);

    expect(mockRepositorioVehiculos.obtenerPorId).toHaveBeenCalledWith(expect.any(UniqueEntityID));
    expect(mockServicioOptimizacionRutas.calcularRutaOptima).toHaveBeenCalledWith(
      [paquete1],
      [vehiculo1, vehiculo2]
    );
    expect(mockRepositorioRutas.guardar).toHaveBeenCalledTimes(1);
    expect(mockRepositorioVehiculos.guardar).toHaveBeenCalledTimes(1);
    expect(mockRepositorioVehiculos.guardar).toHaveBeenCalledWith(expect.objectContaining({
      props: expect.objectContaining({
        estado: EstadoVehiculo.create(EstadoVehiculo.PLANIFICADA).getValue(),
        matricula: vehiculo2.matricula, // Ensure it's vehiculo2 that was updated
      }),
    }));

    expect(output.vehiculoId).toBe(vehiculo2.id.toString());
  });
});
