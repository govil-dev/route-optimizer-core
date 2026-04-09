import { Controller, Post, Body, Param, Inject, HttpCode, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { AsignarVehiculoARutaUseCase } from '../../../../../../Contexts/Rutas/Application/UseCases/AsignarVehiculoARutaUseCase';
import { AsignarVehiculoARutaInput } from '../../../../../../Contexts/Rutas/Application/DTOs/AsignarVehiculoARuta.input';
import { RutaNoEncontradaException } from '../../../../../../Contexts/Rutas/Domain/Exceptions/RutaNoEncontradaException';
import { VehiculoNoEncontradoException } from '../../../../../../Contexts/Rutas/Domain/Exceptions/VehiculoNoEncontradoException';
import { DomainException } from '../../../../../../Shared/Domain/Exceptions/DomainException';
import { CrearRutaOptimaUseCase } from '../../../../../../Contexts/Rutas/Application/UseCases/CrearRutaOptimaUseCase';
import { CalcularRutaOptimaInput } from '../../application/dtos/calcular-ruta-optima.input';
import { RutaYaTieneVehiculoException } from '../../../../../../Contexts/Rutas/Domain/Exceptions/RutaYaTieneVehiculoException';
import { EstadoInvalidoRutaException } from '../../../../../../Contexts/Rutas/Domain/Exceptions/EstadoInvalidoRutaException';
import { EstadoInvalidoVehiculoException } from '../../../../../../Contexts/Rutas/Domain/Exceptions/EstadoInvalidoVehiculoException';
import { CapacidadVehiculoExcedidaException } from '../../../../../../Contexts/Rutas/Domain/Exceptions/CapacidadVehiculoExcedidaException';

class AsignarVehiculoBodyDto {
    vehiculoId: string;
}

@Controller('rutas')
export class RutasController {

    constructor(
        @Inject('CrearRutaOptimaUseCase') private readonly crearRutaOptimaUseCase: CrearRutaOptimaUseCase,
        @Inject('AsignarVehiculoARutaUseCase') private readonly asignarVehiculoARutaUseCase: AsignarVehiculoARutaUseCase
    ) {}

    @Post('optimizar')
    @HttpCode(HttpStatus.OK)
    async calcularRutaOptima(@Body() body: CalcularRutaOptimaInput) {
        try {
            const output = await this.crearRutaOptimaUseCase.execute(body);
            return output;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Post(':rutaId/asignar-vehiculo')
    @HttpCode(HttpStatus.OK)
    async asignarVehiculoARuta(@Param('rutaId') rutaId: string, @Body() body: AsignarVehiculoBodyDto) {
        try {
            const input = new AsignarVehiculoARutaInput(rutaId, body.vehiculoId);
            const output = await this.asignarVehiculoARutaUseCase.execute(input);
            return {
                message: 'Vehículo asignado a la ruta exitosamente',
                data: output,
            };
        } catch (error) {
            if (error instanceof RutaNoEncontradaException || error instanceof VehiculoNoEncontradoException) {
                throw new NotFoundException(error.message);
            }
            if (
                error instanceof RutaYaTieneVehiculoException ||
                error instanceof EstadoInvalidoRutaException ||
                error instanceof EstadoInvalidoVehiculoException ||
                error instanceof CapacidadVehiculoExcedidaException
            ) {
                throw new BadRequestException(error.message);
            }
            if (error instanceof DomainException) {
                throw new BadRequestException(error.message);
            }
            throw error;
        }
    }
}
