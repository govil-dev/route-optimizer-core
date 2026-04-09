import { Controller, Post, UploadedFile, UseInterceptors, Inject, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CargarPaquetesMasivamenteUseCase, CargarPaquetesMasivamenteUseCaseToken } from "../../application/use-cases/cargar-paquetes-masivamente.use-case";
import { FormatoArchivoInvalidoException } from "../../domain/exceptions/formato-archivo-invalido.exception";
import { ApiTags, ApiConsumes, ApiBody } from "@nestjs/swagger";

@ApiTags("Carga Masiva")
@Controller("carga-masiva")
export class CargaMasivaController {

    constructor(
        @Inject(CargarPaquetesMasivamenteUseCaseToken)
        private readonly useCase: CargarPaquetesMasivamenteUseCase,
    ) {}

    @Post("paquetes")
    @UseInterceptors(FileInterceptor("file"))
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                file: {
                    type: "string",
                    format: "binary",
                },
            },
        },
    })
    async cargarPaquetes(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException("No se ha proporcionado ningún archivo.");
        }

        try {
            const fileContent = file.buffer.toString("utf-8");
            const result = await this.useCase.execute({ fileContent });
            return result;
        } catch (error) {
            if (error instanceof FormatoArchivoInvalidoException) {
                throw new BadRequestException(error.message);
            }
            // Log the error for debugging
            console.error(error);
            throw new InternalServerErrorException("Ocurrió un error procesando el archivo.");
        }
    }
}
