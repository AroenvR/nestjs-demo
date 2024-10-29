import { DataSource } from "typeorm";
import { TemplateEntity } from "./entity/TemplateEntity";
import { LogAdapter } from "src/logging/LogAdapter";
import { TemplateService } from "./TemplateService";
import { AbstractCrudSubscriber } from "../abstract/AbstractCrudSubscriber";
import { Inject } from "@nestjs/common";

/**
 * Subscribes and publishes to events for the database's actions on the TemplateEntity table.
 */
export class TemplateSubscriber extends AbstractCrudSubscriber<TemplateEntity> {
    constructor(
        protected readonly logAdapter: LogAdapter,
        protected readonly datasource: DataSource,
        @Inject(TemplateService) protected readonly service: TemplateService,
    ) {
        super(logAdapter, datasource, service);
    }

    public listenTo() {
        return TemplateEntity;
    }
}