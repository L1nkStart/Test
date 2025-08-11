import "server-only";
import mysql from "mysql2/promise";

// Asegúrate de que DATABASE_URL esté configurada en tus variables de entorno.
// Un formato típico sería: mysql://user:password@host:port/database
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL no está definida en las variables de entorno.");
}

// Parse the DATABASE_URL to extract connection details
const urlParts = new URL(databaseUrl);

// Crea un pool de conexiones para MySQL.
const pool = mysql.createPool({
    host: urlParts.hostname,
    port: parseInt(urlParts.port) || 3306,
    user: urlParts.username,
    password: urlParts.password,
    database: urlParts.pathname.slice(1), // Remove leading slash
    charset: 'utf8mb4',
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    // Remove deprecated options that cause warnings in mysql2
    // acquireTimeout and timeout are not valid options for mysql2
});

export default pool;