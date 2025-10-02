import {DatabaseConfig} from "./database-config.model";

export function createDatabaseConfig() {
    return {
        host: process.env['S_DATABASE_HOST'] || 'localhost',
        port: parseInt(process.env['S_DATABASE_PORT'] || '3306'),
        user: process.env['S_DATABASE_USER'] || 'user',
        password: decodeURIComponent(process.env['S_DATABASE_PASSWORD'] || 'password'),
        database: process.env['S_DATABASE_NAME'] || 'siku_zangu',
    } as DatabaseConfig;
}