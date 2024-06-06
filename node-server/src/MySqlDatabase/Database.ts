import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import { IUpdateResult } from "./IUpdateResult";

// Loads the environment variable
dotenv.config();

/**
 * Database singleton class to handle the connection to the database.
 */
export class Database {
    private static databaseInstance: Database;

    private dbConfig = {
        host: process.env.DB_HOST || "host",
        user: process.env.DB_USER as string,
        password: process.env.DB_PASS as string,
        database: process.env.DB_NAME || "database",
        port: parseInt(process.env.DB_PORT as string, 10) || 3306
    };

    private connection: mysql.Connection;

    private constructor() {}

    /**
     * Attempts to make a connection to a Database.
     * @returns A connection to the database.
     */
    private async connectToDatabase(): Promise<mysql.Connection> {
        try {
            const connection = await mysql.createConnection(this.dbConfig);
            console.log("Successfully connected to the database.");
            return connection;
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    /**
     * Gets the instance of the Database.
     * @returns The Database instance.
     */
    public static async getInstance(): Promise<Database> {
        if (!Database.databaseInstance) {
            Database.databaseInstance = new Database();
            this.databaseInstance.connection = await this.databaseInstance.connectToDatabase();
        }
        return this.databaseInstance;
    }

    /**
     * Queries the database with given SQL.
     * @param sql The SQL query.
     * @returns The result of the query.
     */
    public async querySql(sql: string, values: unknown[]): Promise<unknown> {
        try {
            const [results] = await this.connection.execute(sql, values);
            return results;
        } catch (error) {
            console.error("Error executing query:", error);
            throw error;
        }
    }
    
    /**
     * Inserts data into the database.
     * @param sql The SQL query.
     * @param values The values to insert.
     */
    public async insertSql(sql: string, values: unknown): Promise<void> {
        try {
            await this.connection.execute(sql, [values]);
            console.log("Insertion successful.");
        } catch (error) {
            console.error("Error inserting data:", error);
            throw error;
        }
    }

    /**
     * Updates data in the database.
     * @param sql The SQL query.
     * @param params The parameters to update.
     */
    public async updateSql(sql: string, params: unknown[]): Promise<void> {
        try {
            const [result] = await this.connection.execute(sql, params) as IUpdateResult[];
            console.log(`Updated successfully. Affected rows: ${result.affectedRows}`);
        } catch (error) {
            console.error("Error updating data:", error);
            throw error;
        }
    }

    /**
     * Starts a Database transaction (sequence of operations).
     */
    public async beginTransaction(): Promise<void> {
        await this.connection.beginTransaction();
    }

    /**
     * Commits a Database transaction.
     */
    public async commitTransaction(): Promise<void> {
        await this.connection.commit();
    }

    /**
     * Rolls back a Database transaction.
     */
    public async rollbackTransaction(): Promise<void> {
        await this.connection.rollback();
    }
}