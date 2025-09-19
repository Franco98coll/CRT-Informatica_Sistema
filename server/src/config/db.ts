import { createRequire } from "node:module";
import dotenv from "dotenv";
dotenv.config();
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sql: any = require("mssql");

type SqlConfig = {
  user?: string;
  password?: string;
  database?: string;
  server: string;
  port?: number;
  options?: { encrypt?: boolean; trustServerCertificate?: boolean };
};

const encrypt = process.env.DB_ENCRYPT
  ? process.env.DB_ENCRYPT === "true"
  : true;
const trustVar =
  process.env.DB_TRUST_CERT ?? process.env.DB_TRUST_SERVER_CERTIFICATE;
const trust = trustVar ? trustVar === "true" : true;
const instanceName = process.env.DB_INSTANCE;

const sqlConfig: SqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER || process.env.DB_HOST || "localhost",
  // Si se especifica instancia, evitar puerto para permitir resolución por SQL Browser
  ...(instanceName
    ? {}
    : { port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 1433 }),
  options: {
    encrypt,
    trustServerCertificate: trust,
    ...(instanceName ? { instanceName } : {}),
  },
};

let poolPromise: Promise<any> | null = null;

export const getPool = async (): Promise<any> => {
  if (!poolPromise) {
    const safeLog = {
      server: sqlConfig.server,
      instanceName: (sqlConfig as any).options?.instanceName || null,
      port: (sqlConfig as any).port || null,
      database: sqlConfig.database,
      options: {
        encrypt: sqlConfig.options?.encrypt,
        trustServerCertificate: sqlConfig.options?.trustServerCertificate,
      },
    };
    console.log("[MSSQL] Conectando con:", safeLog);
    poolPromise = sql.connect(sqlConfig);
  }
  return poolPromise;
};

export default sql;
