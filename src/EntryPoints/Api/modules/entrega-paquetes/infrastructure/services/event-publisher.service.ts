import { Injectable } from "@nestjs/common";
import { IEventPublisher } from "../../domain/ports/event-publisher";
import { IDomainEvent } from "../../../../../Shared/Domain/DomainEvent";

@Injectable()
export class ConsoleEventPublisher implements IEventPublisher {
    async publish(event: IDomainEvent): Promise<void> {
        console.log("Publishing Domain Event:");
        console.log(JSON.stringify(event, null, 2));
    }
}
