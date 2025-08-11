import "server-only";
import mysql from "mysql2/promise";

// Asegúrate de que DATABASE_URL esté configurada en tus variables de entorno.
// Un formato típico sería: mysql://user:password@host:port/database
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL no está definida en las variables de entorno.");
}

// Crea un pool de conexiones para MySQL.
// mysql2/promise puede parsear directamente una cadena de conexión URL válida.
const pool = mysql.createPool({
    uri: databaseUrl,
    charset: 'utf8mb4',
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
});

export default pool;