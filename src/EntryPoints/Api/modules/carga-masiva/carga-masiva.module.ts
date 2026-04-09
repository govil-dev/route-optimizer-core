import { Module } from "@nestjs/common";
import { CargaMasivaController } from "./infrastructure/controllers/carga-masiva.controller";
import { CargarPaquetesMasivamenteUseCaseToken } from "./application/use-cases/cargar-paquetes-masivamente.use-case";
import { CargarPaquetesMasivamenteUseCaseImpl } from "./application/use-cases/cargar-paquetes-masivamente.use-case-impl";
import { IFileParserServiceToken } from "./domain/ports/file-parser.service";
import { TxtFileParserService } from "./infrastructure/services/txt-file-parser.service";
import { MulterModule } from "@nestjs/platform-express";

// This module assumes that the providers for the following tokens are available application-wide
// or are imported into the root module:
// - "CrearRutaOptimaUseCase"
// - "RepositorioPaquetes"
// - "RepositorioVehiculos"
// - "ServicioGeocodificacion"
// If not, they would need to be imported from their respective modules.

@Module({
    imports: [
        MulterModule.register({
            dest: "./upload", // configure as needed
        }),
    ],
    controllers: [CargaMasivaController],
    providers: [
        {
            provide: CargarPaquetesMasivamenteUseCaseToken,
            useClass: CargarPaquetesMasivamenteUseCaseImpl,
        },
        {
            provide: IFileParserServiceToken,
            useClass: TxtFileParserService,
        },
        // We need to provide the dependencies of CargarPaquetesMasivamenteUseCaseImpl
        // Here we are assuming they are provided by other modules and are injectable.
        // For a real implementation, you might need to import the RutasModule.
        // For example:
        // {
        //     provide: "CrearRutaOptimaUseCase",
        //     useClass: CrearRutaOptimaUseCaseImpl, // From Rutas context
        // },
    ],
})
export class CargaMasivaModule {}
