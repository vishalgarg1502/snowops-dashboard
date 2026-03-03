import { NextResponse } from 'next/server';
import { getDeviceStatusInfo, getTodayLogRecords, getTodayTrips, getActiveFaults, getLatestVehicleMetadata } from '@/lib/geotab';

export async function GET() {
    try {
        const [deviceStatuses, logRecords, trips, faults, metadata] = await Promise.allSettled([
            getDeviceStatusInfo(),
            getTodayLogRecords(),
            getTodayTrips(),
            getActiveFaults(),
            getLatestVehicleMetadata(),
        ]);

        return NextResponse.json({
            deviceStatuses: deviceStatuses.status === 'fulfilled' ? deviceStatuses.value : [],
            logRecords: logRecords.status === 'fulfilled' ? logRecords.value : [],
            trips: trips.status === 'fulfilled' ? trips.value : [],
            faults: faults.status === 'fulfilled' ? faults.value : [],
            metadata: metadata.status === 'fulfilled' ? metadata.value : [],
            timestamp: new Date().toISOString(),
        });
    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
