"use client";

import React from "react";
import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";

interface Vehicle {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    speed: number;
    isDriving: boolean;
}

interface LogPoint {
    deviceId: string;
    lat: number;
    lng: number;
}

interface LiveMapProps {
    vehicles: Vehicle[];
    logRecords: LogPoint[];
}

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const OAKVILLE_CENTER = { lat: 43.4675, lng: -79.6877 };

// Colors for vehicle routes
const ROUTE_COLORS = [
    "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6",
    "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#6366f1",
];

function RoutesOverlay({ logRecords }: { logRecords: LogPoint[] }) {
    const map = useMap();

    React.useEffect(() => {
        if (!map || !logRecords.length) return;
        const polylines: google.maps.Polyline[] = [];

        // Group by device
        const byDevice: Record<string, LogPoint[]> = {};
        logRecords.forEach((p) => {
            if (!byDevice[p.deviceId]) byDevice[p.deviceId] = [];
            byDevice[p.deviceId].push(p);
        });

        const deviceIds = Object.keys(byDevice);
        deviceIds.forEach((devId, i) => {
            const path = byDevice[devId].map((p) => ({ lat: p.lat, lng: p.lng }));
            if (path.length < 2) return;
            const polyline = new google.maps.Polyline({
                path,
                geodesic: true,
                strokeColor: ROUTE_COLORS[i % ROUTE_COLORS.length],
                strokeOpacity: 0.7,
                strokeWeight: 2,
                map,
            });
            polylines.push(polyline);
        });

        return () => polylines.forEach((p) => p.setMap(null));
    }, [map, logRecords]);

    return null;
}

export default function LiveMap({ vehicles, logRecords }: LiveMapProps) {
    if (!MAPS_KEY) {
        return (
            <div className="flex items-center justify-center h-full bg-slate-800 rounded-xl text-slate-400">
                <p>Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local to enable maps</p>
            </div>
        );
    }

    return (
        <APIProvider apiKey={MAPS_KEY}>
            <Map
                defaultCenter={OAKVILLE_CENTER}
                defaultZoom={11}
                mapId="snowops-map"
                className="w-full h-full rounded-xl"
                colorScheme="DARK"
            >
                <RoutesOverlay logRecords={logRecords} />
                {vehicles.map((v) =>
                    v.latitude && v.longitude ? (
                        <Marker
                            key={v.id}
                            position={{ lat: v.latitude, lng: v.longitude }}
                            title={`${v.name} — ${v.isDriving ? v.speed + " km/h" : "Stopped"}`}
                        />
                    ) : null
                )}
            </Map>
        </APIProvider>
    );
}
