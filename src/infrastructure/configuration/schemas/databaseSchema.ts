import Joi from 'joi';

/**
 * Joi schema for SQLite configuration.
 */
const sqliteConfigSchema = Joi.object({
    driver: Joi.string().valid('sqlite').required(),
    database: Joi.string().required(),
    runMigrations: Joi.boolean().required(),
    synchronize: Joi.boolean().required(),
    _comment: Joi.any().optional(), // Allow _comment field
}).required();

/**
 * Joi schema for Postgres configuration.
 */
const postgresConfigSchema = Joi.object({
    driver: Joi.string().valid('postgres').required(),
    database: Joi.string().required(),
    host: Joi.string().required(),
    port: Joi.number().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
    runMigrations: Joi.boolean().required(),
    synchronize: Joi.boolean().required(),
    _comment: Joi.any().optional(), // Allow _comment field
}).required();

/**
 * Joi schema for TDatabaseConfig.
 */
export const databaseSchema = Joi.alternatives().try(sqliteConfigSchema, postgresConfigSchema).required();
