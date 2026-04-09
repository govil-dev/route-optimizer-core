import { Module, Provider } from "@nestjs/common";
import { EntregaPaquetesController } from "./infrastructure/controllers/entrega-paquetes.controller";
import { MarcarEstadoEntregaPaqueteUseCaseToken } from "./application/use-cases/marcar-estado-entrega-paquete.use-case";
import { MarcarEstadoEntregaPaqueteUseCaseImpl } from "./application/use-cases/marcar-estado-entrega-paquete.use-case-impl";
import { IEventPublisherToken } from "./domain/ports/event-publisher";
import { ConsoleEventPublisher } from "./infrastructure/services/event-publisher.service";
import { RepositorioPaquetes } from "../../../Contexts/Rutas/Domain/Ports/RepositorioPaquetes";
import { Paquete } from "../../../Contexts/Rutas/Domain/Entities/Paquete";
import { PaqueteId } from "../../../Contexts/Rutas/Domain/ValueObjects/PaqueteId";

// Mock RepositorioPaquetes for demonstration purposes as it belongs to another context.
const mockRepositorioPaquetesProvider: Provider = {
    provide: "RepositorioPaquetes",
    useValue: {
        obtenerPorId: jest.fn(),
        guardar: jest.fn(),
    },
};

@Module({
    controllers: [EntregaPaquetesController],
    providers: [
        {
            provide: MarcarEstadoEntregaPaqueteUseCaseToken,
            useClass: MarcarEstadoEntregaPaqueteUseCaseImpl,
        },
        {
            provide: IEventPublisherToken,
            useClass: ConsoleEventPublisher,
        },
        // In a real application, this would be provided by an infrastructure module for the Rutas context.
        mockRepositorioPaquetesProvider,
    ],
})
export class EntregaPaquetesModule {}
