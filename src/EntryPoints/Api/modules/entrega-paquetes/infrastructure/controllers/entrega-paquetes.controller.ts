import { Body, Controller, Inject, Post } from "@nestjs/common";
import { MarcarEstadoEntregaPaqueteUseCase, MarcarEstadoEntregaPaqueteUseCaseToken } from "../../application/use-cases/marcar-estado-entrega-paquete.use-case";
import { MarcarEstadoEntregaPaqueteInput } from "../../application/dtos/marcar-estado-entrega-paquete.input";
import { MarcarEstadoEntregaPaqueteOutput } from "../../application/dtos/marcar-estado-entrega-paquete.output";

@Controller('entrega-paquetes')
export class EntregaPaquetesController {
    constructor(
        @Inject(MarcarEstadoEntregaPaqueteUseCaseToken)
        private readonly marcarEstadoEntregaPaqueteUseCase: MarcarEstadoEntregaPaqueteUseCase,
    ) {}

    @Post('/marcar-estado')
    async marcarEstado(@Body() input: MarcarEstadoEntregaPaqueteInput): Promise<MarcarEstadoEntregaPaqueteOutput> {
        return this.marcarEstadoEntregaPaqueteUseCase.execute(input);
    }
}
