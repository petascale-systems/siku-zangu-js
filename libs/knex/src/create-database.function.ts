import {DatabaseConfig} from "./database-config.model";
import {knex} from "knex";
import {createDatabaseConfig} from "./create-database-config.function";

function _createDatabase(config: DatabaseConfig) {
    return knex({
        client: 'mysql2',
        connection: {
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database,
            timezone: '+00:00',
        },
        pool: {min: 1, max: 100}
    });
}

export const DATABASE_CONFIG = createDatabaseConfig()
export const DATABASE = _createDatabase(DATABASE_CONFIG)