import sql from 'mssql';

// Basic MSSQL connection pool (LocalDB)
// Adjust connection string via MSSQL_CONN or default to (localdb)\\MSSQLLocalDB

const LOG_DISABLE = process.env.LOG_DISABLE_MSSQL === '1';
// Allow custom timeout override (ms)
const CONNECT_TIMEOUT_MS = parseInt(process.env.MSSQL_CONN_TIMEOUT_MS || '8000', 10); // default 8s
// Basic connection string (can be overridden entirely)
const connStr = process.env.MSSQL_CONN || 'Server=(localdb)\\MSSQLLocalDB;Database=CampusTrailLogs;Trusted_Connection=Yes;MultipleActiveResultSets=true';

// Optional discrete config envs (take precedence if MSSQL_SERVER specified)
const explicitServer = process.env.MSSQL_SERVER;
const explicitDb = process.env.MSSQL_DB || 'CampusTrailLogs';
const explicitUser = process.env.MSSQL_USER;
const explicitPass = process.env.MSSQL_PASSWORD;
const explicitDriver = process.env.MSSQL_DRIVER; // e.g. 'msnodesqlv8'
const useTrusted = process.env.MSSQL_TRUSTED === '1'; // only works with msnodesqlv8

function buildConfig() {
  if (explicitServer) {
    const base: any = {
      server: explicitServer,
      database: explicitDb,
      options: {
        trustServerCertificate: true,
        encrypt: false
      },
      pool: { max: 5, min: 0, idleTimeoutMillis: 10000 }
    };
    if (explicitDriver) base.driver = explicitDriver;
    if (explicitUser && explicitPass) {
      base.user = explicitUser;
      base.password = explicitPass;
    } else if (useTrusted) {
      // Only valid if msnodesqlv8 is installed
      base.options.trustedConnection = true;
    }
    return base;
  }
  return null;
}

let pool: sql.ConnectionPool | null = null;
let disabledLogged = false;

export async function getPool() {
  if (LOG_DISABLE) {
    if (!disabledLogged) { console.log('[log] MSSQL logging disabled via LOG_DISABLE_MSSQL'); disabledLogged = true; }
    throw new Error('LOGGING_DISABLED');
  }
  if (pool) return pool;
  // Wrap with manual timeout
  // Prefer explicit config if provided, else attempt connection string
  const configObj = buildConfig();
  const connectPromise = configObj ? sql.connect(configObj) : sql.connect(connStr);
  pool = await Promise.race([
    connectPromise,
    new Promise<any>((_, reject) => setTimeout(()=> reject(new Error('CONNECT_TIMEOUT')), CONNECT_TIMEOUT_MS))
  ]);
  return pool;
}

export interface LogEntry {
  eventType: string; // LOGIN, PRODUCT_VIEW, PRODUCT_ADD, CART_ADD, RENTAL_CREATE, etc.
  userEmail?: string | null;
  entityType?: string | null; // PRODUCT, GEAR_ITEM, ITINERARY, etc.
  entityId?: string | null;
  details?: any;
}

export async function initLoggingSchema(retry = 0): Promise<void> {
  if (LOG_DISABLE) return; // nothing to init
  try {
    const p = await getPool();
  if (!p) throw new Error('NO_POOL');
  await p.request().batch(`
      IF NOT EXISTS(SELECT * FROM sysobjects WHERE name='EventLog' and xtype='U')
      CREATE TABLE EventLog (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        EventType NVARCHAR(64) NOT NULL,
        UserEmail NVARCHAR(256) NULL,
        EntityType NVARCHAR(64) NULL,
        EntityId NVARCHAR(64) NULL,
        Details NVARCHAR(MAX) NULL
      );
    `);
  } catch (e: any) {
    if (['CONNECT_TIMEOUT','LOGGING_DISABLED'].includes(e.message)) {
      console.warn(`[log] MSSQL logging unavailable (${e.message}). Continuing without DB logging.`);
      return;
    }
    if (retry < 1) { // single retry quickly
      console.warn('[log] initLoggingSchema retry due to error:', e.message);
      await new Promise(r=> setTimeout(r, 500));
      return initLoggingSchema(retry + 1);
    }
    console.warn('[log] initLoggingSchema failed permanently:', e.message);
  }
}

export async function logEvent(entry: LogEntry) {
  if (LOG_DISABLE) return; // no-op when disabled
  try {
    const p = await getPool();
  if (!p) return; // silently skip
  await p.request()
      .input('EventType', sql.NVarChar(64), entry.eventType)
      .input('UserEmail', sql.NVarChar(256), entry.userEmail || null)
      .input('EntityType', sql.NVarChar(64), entry.entityType || null)
      .input('EntityId', sql.NVarChar(64), entry.entityId || null)
      .input('Details', sql.NVarChar(sql.MAX), entry.details ? JSON.stringify(entry.details) : null)
      .query(`INSERT INTO EventLog(EventType,UserEmail,EntityType,EntityId,Details) VALUES(@EventType,@UserEmail,@EntityType,@EntityId,@Details)`);
  } catch (e: any) {
    if (!/CONNECT_TIMEOUT|ELOGIN|EALREADYCONNECTED|EALREADYCONNECTING|LOGGING_DISABLED/.test(e.message)) {
      console.warn('logEvent failed', e.message);
    }
  }
}
