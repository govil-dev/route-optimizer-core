import { IDomainEvent } from "../../../../../Shared/Domain/DomainEvent";

export const IEventPublisherToken = Symbol("IEventPublisher");

export interface IEventPublisher {
    publish(event: IDomainEvent): Promise<void>;
}
