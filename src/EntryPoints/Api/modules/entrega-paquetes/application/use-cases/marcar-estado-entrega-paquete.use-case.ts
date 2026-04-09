import { UseCase } from "../../../../../Shared/Application/UseCase";
import { MarcarEstadoEntregaPaqueteInput } from "../dtos/marcar-estado-entrega-paquete.input";
import { MarcarEstadoEntregaPaqueteOutput } from "../dtos/marcar-estado-entrega-paquete.output";

export const MarcarEstadoEntregaPaqueteUseCaseToken = Symbol("MarcarEstadoEntregaPaqueteUseCase");

export interface MarcarEstadoEntregaPaqueteUseCase extends UseCase<MarcarEstadoEntregaPaqueteInput, Promise<MarcarEstadoEntregaPaqueteOutput>> {}
