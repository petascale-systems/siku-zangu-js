/**
 * SQL database connection configurations.
 */
export type DatabaseConfig = {
    /**
     * Server host/IP.
     */
    readonly host: string;

    /**
     * Server port.
     */
    readonly port: number;

    /**
     * Server login user.
     */
    readonly user: string;

    /**
     * Server login password.
     */
    readonly password: string;

    /**
     * Database name where all the tables can be found.
     */
    readonly database: string;
}