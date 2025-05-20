import Joi from "joi";
import { DatabaseDrivers, SqliteDatabaseDrivers } from "../../../infrastructure/database/TDatabaseConfig";

/**
 * Joi schema for SQLite configuration.
 */
const sqliteConfigSchema = Joi.object({
	driver: Joi.string()
		.valid(...Object.values(SqliteDatabaseDrivers))
		.required(),
	database: Joi.string().required(),
	synchronize: Joi.boolean().required(),
}).required();

/**
 * Joi schema for Postgres configuration.
 */
const postgresConfigSchema = Joi.object({
	driver: Joi.string().valid(DatabaseDrivers.POSTGRES).required(),
	database: Joi.string().required(),
	host: Joi.string().required(),
	port: Joi.number().required(),
	username: Joi.string().required(),
	password: Joi.string().required(),
	synchronize: Joi.boolean().required(),
}).required();

/**
 * Joi schema for TDatabaseConfig.
 */
export const databaseSchema = Joi.alternatives().try(sqliteConfigSchema, postgresConfigSchema).required();
