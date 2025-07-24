import { Provider } from "@nestjs/common";
import { IExternalEventConsumer } from "./IExternalEventConsumer";
import { WinstonAdapter } from "../../common/utility/logging/adapters/WinstonAdapter";
import { ExternalEventConsumer } from "./ExternalEventConsumer";

/**
 * Factory token for creating instances of IExternalEventConsumer.
 */
export const EXTERNAL_EVENT_CONSUMER_FACTORY = "ExternalEventConsumerFactory";

/**
 * Factory type for creating instances of IExternalEventConsumer.
 * This factory function returns a new instance of an external event consumer.
 * It is used to create event consumers that can connect to an external event source
 * and process incoming events.
 */
export type IExternalEventConsumerFactory = () => IExternalEventConsumer;

/**
 * Provider for the IExternalEventConsumerFactory.
 * This provider uses the WinstonAdapter to create a new instance of ExternalEventConsumer.
 * It is registered in the NestJS dependency injection system, allowing it to be injected
 * wherever an IExternalEventConsumer is needed.
 */
export const ExternalEventConsumerFactoryProvider: Provider = {
	provide: EXTERNAL_EVENT_CONSUMER_FACTORY,
	useFactory: (logger: WinstonAdapter): (() => IExternalEventConsumer) => {
		return () => new ExternalEventConsumer(logger);
	},
	inject: [WinstonAdapter],
};
