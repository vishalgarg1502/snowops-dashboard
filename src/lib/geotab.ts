/**
 * Geotab API + Data Connector helpers.
 *
 * Auth flow:
 *   1. POST to /apiv1 with Authenticate method → get session credentials
 *   2. Reuse credentials for all subsequent API calls
 *
 * Data Connector (OData):
 *   - Base URL: https://odata-connector-{server}.geotab.com/odata/v4/svc/
 *   - Auth: HTTP Basic with "database/username" as username
 *   - Servers: 1=EU, 2=US, 3=CA, 4=AU, 5=BR, 6=AS, 7=USGov
 */

const GEOTAB_SERVER = process.env.GEOTAB_SERVER || 'my.geotab.com';
const GEOTAB_DATABASE = process.env.GEOTAB_DATABASE || '';
const GEOTAB_USERNAME = process.env.GEOTAB_USERNAME || '';
const GEOTAB_PASSWORD = process.env.GEOTAB_PASSWORD || '';

const API_URL = `https://${GEOTAB_SERVER}/apiv1`;

export interface GeotabCredentials {
    userName: string;
    sessionId: string;
    database: string;
    server: string;
}

let cachedCreds: GeotabCredentials | null = null;
let credsExpiry = 0;

/** Authenticate and return session credentials (cached for 10 min). */
export async function getCredentials(): Promise<GeotabCredentials> {
    if (cachedCreds && Date.now() < credsExpiry) return cachedCreds;

    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            method: 'Authenticate',
            params: {
                database: GEOTAB_DATABASE,
                userName: GEOTAB_USERNAME,
                password: GEOTAB_PASSWORD,
            },
        }),
    });

    if (!res.ok) throw new Error(`Geotab auth failed: ${res.statusText}`);
    const data = await res.json();
    if (data.error) throw new Error(`Geotab auth error: ${data.error.message}`);

    cachedCreds = data.result.credentials;
    credsExpiry = Date.now() + 9 * 60 * 1000; // 9 min
    return cachedCreds!;
}

/** Generic Geotab API call. */
export async function geotabCall<T>(method: string, params: Record<string, unknown>): Promise<T> {
    const creds = await getCredentials();
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, params: { ...params, credentials: creds } }),
    });
    if (!res.ok) throw new Error(`Geotab API error: ${res.statusText}`);
    const data = await res.json();
    if (data.error) throw new Error(`Geotab API error: ${data.error.message}`);
    return data.result as T;
}

/** Fetch all Devices (vehicles). */
export async function getDevices() {
    return geotabCall<unknown[]>('Get', { typeName: 'Device' });
}

/** Fetch current status/location of all vehicles. */
export async function getDeviceStatusInfo() {
    return geotabCall<unknown[]>('Get', { typeName: 'DeviceStatusInfo' });
}

/** Fetch today's GPS breadcrumbs (LogRecords) for all vehicles. */
export async function getTodayLogRecords() {
    const fromDate = new Date();
    fromDate.setHours(0, 0, 0, 0);
    return geotabCall<unknown[]>('Get', {
        typeName: 'LogRecord',
        search: { fromDate: fromDate.toISOString(), toDate: new Date().toISOString() },
    });
}

/** Fetch active fault data (top results). */
export async function getActiveFaults() {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7);
    return geotabCall<unknown[]>('Get', {
        typeName: 'FaultData',
        search: { fromDate: fromDate.toISOString(), toDate: new Date().toISOString() },
        resultsLimit: 100,
    });
}

/** Fetch today's trip data for scoreboard. */
export async function getTodayTrips() {
    const fromDate = new Date();
    fromDate.setHours(0, 0, 0, 0);
    return geotabCall<unknown[]>('Get', {
        typeName: 'Trip',
        search: { fromDate: fromDate.toISOString(), toDate: new Date().toISOString() },
    });
}

// ---------------------------------------------------------------------------
// Data Connector (OData) helpers
// ---------------------------------------------------------------------------

/** Find the correct OData server for this database (tries 1-7). */
async function findOdataServer(): Promise<number> {
    for (let i = 1; i <= 7; i++) {
        try {
            const url = `https://odata-connector-${i}.geotab.com/odata/v4/svc/LatestVehicleMetadata?$top=1`;
            const basicAuth = Buffer.from(`${GEOTAB_DATABASE}/${GEOTAB_USERNAME}:${GEOTAB_PASSWORD}`).toString('base64');
            const res = await fetch(url, {
                headers: { Authorization: `Basic ${basicAuth}` },
                signal: AbortSignal.timeout(4000),
            });
            if (res.ok) return i;
        } catch {
            // try next
        }
    }
    throw new Error('Could not find OData server for this database');
}

let cachedOdataServer: number | null = null;

async function getOdataBase(): Promise<string> {
    if (!cachedOdataServer) cachedOdataServer = await findOdataServer();
    return `https://odata-connector-${cachedOdataServer}.geotab.com/odata/v4/svc`;
}

async function odataFetch(table: string, query: string = ''): Promise<unknown[]> {
    const base = await getOdataBase();
    const basicAuth = Buffer.from(`${GEOTAB_DATABASE}/${GEOTAB_USERNAME}:${GEOTAB_PASSWORD}`).toString('base64');
    const url = `${base}/${table}${query ? '?' + query : ''}`;
    const res = await fetch(url, { headers: { Authorization: `Basic ${basicAuth}` } });
    if (!res.ok) throw new Error(`OData error ${res.status}: ${res.statusText}`);
    const data = await res.json();
    return data.value ?? [];
}

/** Fetch last 7 days of vehicle KPIs for scoreboard. */
export async function getVehicleKpis() {
    return odataFetch('VehicleKpi_Daily', '$search=last_7_day');
}

/** Fetch latest vehicle metadata (includes last GPS). */
export async function getLatestVehicleMetadata() {
    return odataFetch('LatestVehicleMetadata');
}
