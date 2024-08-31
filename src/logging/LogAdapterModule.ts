import { Global, Module } from "@nestjs/common";
import { LogAdapter } from "./LogAdapter";

@Global()
@Module({
    providers: [LogAdapter],
    exports: [LogAdapter]
})
export class LogAdapterModule { }