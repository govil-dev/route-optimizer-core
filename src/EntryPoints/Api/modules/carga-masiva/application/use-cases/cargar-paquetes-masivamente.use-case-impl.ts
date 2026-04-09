import { Inject, Injectable } from "@nestjs/common";
import { CargarPaquetesMasivamenteUseCase } from "./cargar-paquetes-masivamente.use-case";
import { CargarPaquetesMasivamenteInput } from "../dtos/cargar-paquetes-masivamente.input";
import { CargarPaquetesMasivamenteOutput } from "../dtos/cargar-paquetes-masivamente.output";
import { IFileParserService, IFileParserServiceToken } from "../../domain/ports/file-parser.service";
import { CrearRutaOptimaUseCase } from "../../../../../../Contexts/Rutas/Application/UseCases/CrearRutaOptimaUseCase";
import { RepositorioPaquetes } from "../../../../../../Contexts/Rutas/Domain/Ports/RepositorioPaquetes";
import { RepositorioVehiculos } from "../../../../../../Contexts/Rutas/Domain/Ports/RepositorioVehiculos";
import { ServicioGeocodificacion } from "../../../../../../Contexts/Rutas/Domain/Ports/ServicioGeocodificacion";
import { FormatoArchivoInvalidoException } from "../../domain/exceptions/formato-archivo-invalido.exception";
import { Paquete } from "../../../../../../Contexts/Rutas/Domain/Entities/Paquete";
import { Ubicacion } from "../../../../../../Contexts/Rutas/Domain/ValueObjects/Ubicacion";
import { VentanaTiempo } from "../../../../../../Contexts/Rutas/Domain/ValueObjects/VentanaTiempo";
import { PaqueteConCoordenadasInvalidasException } from "../../domain/exceptions/paquete-con-coordenadas-invalidas.exception";
import { UniqueEntityID } from "../../../../../../Shared/Domain/UniqueEntityID";
import { NoHayVehiculosDisponiblesException } from "../../domain/exceptions/no-hay-vehiculos-disponibles.exception";

@Injectable()
export class CargarPaquetesMasivamenteUseCaseImpl implements CargarPaquetesMasivamenteUseCase {

    constructor(
        @Inject(IFileParserServiceToken)
        private readonly fileParserService: IFileParserService,
        @Inject("CrearRutaOptimaUseCase") // Assuming token is string name
        private readonly crearRutaOptimaUseCase: CrearRutaOptimaUseCase,
        @Inject("RepositorioPaquetes")
        private readonly repositorioPaquetes: RepositorioPaquetes,
        @Inject("RepositorioVehiculos")
        private readonly repositorioVehiculos: RepositorioVehiculos,
        @Inject("ServicioGeocodificacion")
        private readonly servicioGeocodificacion: ServicioGeocodificacion,
    ) {}

    async execute(input: CargarPaquetesMasivamenteInput): Promise<CargarPaquetesMasivamenteOutput> {
        const paquetesConErroresDeParsing: { id: string; error: string }[] = [];
        const paquetesParaOptimizarIds: string[] = [];

        let parsedData;
        try {
            parsedData = await this.fileParserService.parse(input.fileContent);
        } catch (error) {
            if (error instanceof FormatoArchivoInvalidoException) {
                // If the whole file format is wrong, rethrow
                throw error;
            }
            // Otherwise, it might be a partial error, though our current parser fails completely.
            // This is for future-proofing.
            paquetesConErroresDeParsing.push({ id: "N/A", error: error.message });
            parsedData = [];
        }

        for (const pkgData of parsedData) {
            try {
                const ubicacion = await this.servicioGeocodificacion.obtenerUbicacion(pkgData.address);
                if (!ubicacion || ubicacion.latitud !== pkgData.lat || ubicacion.longitud !== pkgData.lng) {
                    throw new PaqueteConCoordenadasInvalidasException(`Coordenadas para la dirección ${pkgData.address} no son válidas o no coinciden.`);
                }

                const [start, end] = pkgData.timeWindow.split(" ")[1].split("-");
                const datePart = pkgData.timeWindow.split(" ")[0];
                const ventanaTiempo = new VentanaTiempo(
                    new Date(`${datePart}T${start}:00`),
                    new Date(`${datePart}T${end}:00`)
                );

                const paquete = Paquete.create({
                    direccion: pkgData.address,
                    peso: pkgData.weightKg,
                    ubicacion,
                    ventanaEntrega: ventanaTiempo,
                    perecedero: pkgData.priority.toUpperCase() === "ALTA",
                }, new UniqueEntityID(pkgData.packageId));

                await this.repositorioPaquetes.guardar(paquete);
                paquetesParaOptimizarIds.push(paquete.id.toString());

            } catch (error) {
                paquetesConErroresDeParsing.push({
                    id: pkgData.packageId,
                    error: error.message,
                });
            }
        }

        if (paquetesParaOptimizarIds.length === 0) {
            return {
                rutaId: null,
                vehiculoId: null,
                paradas: [],
                paquetesAsignados: [],
                paquetesNoAsignados: [],
                paquetesConErroresDeParsing,
                distanciaTotal: 0,
                duracionEstimada: 0,
            };
        }

        const vehiculosDisponibles = await this.repositorioVehiculos.obtenerVehiculosDisponibles();
        if (vehiculosDisponibles.length === 0) {
            throw new NoHayVehiculosDisponiblesException("No hay vehículos disponibles para asignar la ruta.");
        }
        const vehiculoIds = vehiculosDisponibles.map(v => v.id.toString());

        const resultadoOptimizacion = await this.crearRutaOptimaUseCase.execute({
            paqueteIds: paquetesParaOptimizarIds,
            vehiculoIds: vehiculoIds,
            puntoPartida: { latitud: 0, longitud: 0 } // Assuming a central depot, should be configurable
        });

        return {
            ...resultadoOptimizacion,
            paquetesNoAsignados: [
                ...resultadoOptimizacion.paquetesNoAsignados,
                ...paquetesConErroresDeParsing.map(p => p.id)
            ],
            paquetesConErroresDeParsing,
        };
    }
}
