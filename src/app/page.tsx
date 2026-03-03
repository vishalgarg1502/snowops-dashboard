"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { RefreshCw, Truck, Fuel, Clock, ShieldAlert } from "lucide-react";
import Scoreboard from "@/components/Scoreboard";
import AlertPanel from "@/components/AlertPanel";
import AskFleetChat from "@/components/AskFleetChat";

// Dynamic import for LiveMap to avoid SSR issues with Google Maps
const LiveMap = dynamic(() => import("@/components/LiveMap"), { ssr: false });

interface VehicleScore {
  id: string;
  name: string;
  distanceKm: number;
  fuelL: number;
  fuelEfficiencyKmL: number;
  idleMinutes: number;
  safetyScore: number;
}

interface VehicleMapEntry {
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

interface FleetAlert {
  id: string;
  vehicleName: string;
  faultCode: string;
  description: string;
  timestamp: string;
  severity: "critical" | "warning" | "info";
}

interface FleetData {
  deviceStatuses: Record<string, unknown>[];
  logRecords: Record<string, unknown>[];
  trips: Record<string, unknown>[];
  faults: Record<string, unknown>[];
  metadata: Record<string, unknown>[];
  timestamp: string;
}

function transformFleetData(raw: FleetData) {
  // Map vehicles from deviceStatuses
  const vehicles: VehicleMapEntry[] = (raw.deviceStatuses || []).map((s) => ({
    id: (s.device as { id: string })?.id || String(s.id),
    name: (s.device as { name?: string })?.name || `Vehicle ${(s.device as { id: string })?.id}`,
    latitude: (s.latitude as number) || 0,
    longitude: (s.longitude as number) || 0,
    speed: (s.speed as number) || 0,
    isDriving: (s.isDriving as boolean) || false,
  }));

  // Log records for routes
  const logPoints: LogPoint[] = (raw.logRecords || []).map((r) => ({
    deviceId: (r.device as { id: string })?.id || "",
    lat: (r.latitude as number) || 0,
    lng: (r.longitude as number) || 0,
  }));

  // Build scoreboard from trips
  const tripsByDevice: Record<string, { distanceM: number; idleMs: number; count: number }> = {};
  (raw.trips || []).forEach((t) => {
    const devId = (t.device as { id: string })?.id || "";
    if (!tripsByDevice[devId]) tripsByDevice[devId] = { distanceM: 0, idleMs: 0, count: 0 };
    tripsByDevice[devId].distanceM += (t.distance as number) || 0;
    // idlingDuration is "HH:mm:ss" string
    const idle = t.idlingDuration as string;
    if (idle) {
      const parts = idle.split(":").map(Number);
      tripsByDevice[devId].idleMs += ((parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0)) * 1000;
    }
    tripsByDevice[devId].count += 1;
  });

  const scores: VehicleScore[] = Object.entries(tripsByDevice).map(([devId, kpi], i) => {
    const status = (raw.deviceStatuses || []).find(
      (s) => (s.device as { id: string })?.id === devId
    );
    const name = (status?.device as { name?: string })?.name || `Vehicle ${devId}`;
    const distanceKm = kpi.distanceM / 1000;
    const fuelL = distanceKm / 10 + Math.random() * 5; // placeholder until fuel diagnostic
    const fuelEfficiencyKmL = fuelL > 0 ? distanceKm / fuelL : 0;
    const idleMinutes = Math.round(kpi.idleMs / 60000);
    return {
      id: devId,
      name,
      distanceKm: parseFloat(distanceKm.toFixed(2)),
      fuelL: parseFloat(fuelL.toFixed(2)),
      fuelEfficiencyKmL: parseFloat(fuelEfficiencyKmL.toFixed(2)),
      idleMinutes,
      safetyScore: Math.max(0, 100 - idleMinutes * 0.5 - (i % 4) * 5), // heuristic
    };
  });

  // Alerts from faults
  const alerts: FleetAlert[] = (raw.faults || []).slice(0, 5).map((f) => ({
    id: String(f.id),
    vehicleName: `Vehicle ${(f.device as { id: string })?.id || "?"}`,
    faultCode: (f.diagnostic as { id: string })?.id || "Unknown",
    description: (f.faultState as string) === "Active" ? "Active engine fault detected" : "Historical fault",
    timestamp: (f.dateTime as string) || new Date().toISOString(),
    severity: (f.malfunctionLamp as boolean) ? "critical" : "warning",
  }));

  // Summary metrics
  const totalActive = vehicles.filter((v) => v.isDriving).length;
  const totalDistanceKm = scores.reduce((s, v) => s + v.distanceKm, 0);
  const avgEfficiency = scores.length > 0
    ? scores.reduce((s, v) => s + v.fuelEfficiencyKmL, 0) / scores.length
    : 0;
  const totalIdleMin = scores.reduce((s, v) => s + v.idleMinutes, 0);

  return { vehicles, logPoints, scores, alerts, totalActive, totalDistanceKm, avgEfficiency, totalIdleMin };
}

function MetricCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-xl font-bold text-slate-100">{value}</p>
        <p className="text-xs text-slate-500">{sub}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [fleetData, setFleetData] = useState<FleetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchFleet = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/fleet");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFleetData(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFleet();
    const interval = setInterval(fetchFleet, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, [fetchFleet]);

  const transformed = fleetData ? transformFleetData(fleetData) : null;

  const fleetContext = transformed
    ? {
      totalVehicles: transformed.vehicles.length,
      activeVehicles: transformed.totalActive,
      totalDistanceKmToday: parseFloat(transformed.totalDistanceKm.toFixed(1)),
      avgFuelEfficiencyKmL: parseFloat(transformed.avgEfficiency.toFixed(2)),
      totalIdleMinutes: transformed.totalIdleMin,
      activeAlerts: transformed.alerts.length,
      topVehicles: transformed.scores.slice(0, 5).map((v) => ({
        name: v.name,
        distanceKm: v.distanceKm,
        fuelEfficiencyKmL: v.fuelEfficiencyKmL,
        idleMinutes: v.idleMinutes,
      })),
    }
    : {};

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-lg">❄️</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">SnowOps Intelligence</h1>
            <p className="text-xs text-slate-400">Oakville Public Works Fleet · {transformed?.vehicles.length || 0} vehicles</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && <span className="text-xs text-slate-500">Updated {lastUpdated}</span>}
          <button
            onClick={fetchFleet}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </header>

      {error && (
        <div className="mx-6 mt-4 bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm">
          ⚠️ <strong>Connection Error:</strong> {error}. Please check your Geotab credentials in <code>.env.local</code>.
        </div>
      )}

      <main className="p-6 space-y-6">
        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            icon={<Truck className="w-5 h-5 text-blue-400" />}
            label="Active Vehicles"
            value={`${transformed?.totalActive || 0} / ${transformed?.vehicles.length || 0}`}
            sub="Currently driving"
            color="bg-blue-500/20"
          />
          <MetricCard
            icon={<span className="text-lg">📍</span>}
            label="Total Distance Today"
            value={`${transformed?.totalDistanceKm.toFixed(0) || "0"} km`}
            sub="Fleet combined"
            color="bg-emerald-500/20"
          />
          <MetricCard
            icon={<Fuel className="w-5 h-5 text-yellow-400" />}
            label="Avg Fuel Efficiency"
            value={`${transformed?.avgEfficiency.toFixed(2) || "0"} km/L`}
            sub="Fleet average"
            color="bg-yellow-500/20"
          />
          <MetricCard
            icon={<Clock className="w-5 h-5 text-orange-400" />}
            label="Total Idle Time"
            value={`${transformed?.totalIdleMin || 0} min`}
            sub="Fleet combined today"
            color="bg-orange-500/20"
          />
        </div>

        {/* Map + Chat Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Map */}
          <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden" style={{ height: "420px" }}>
            <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold">Live Fleet Map</span>
              <span className="text-xs text-slate-500 ml-auto">Oakville, ON</span>
            </div>
            <div className="h-[368px]">
              <LiveMap
                vehicles={transformed?.vehicles || []}
                logRecords={transformed?.logPoints || []}
              />
            </div>
          </div>

          {/* Gemini Chat */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden flex flex-col" style={{ height: "420px" }}>
            <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-2">
              <span className="text-lg">✨</span>
              <span className="text-sm font-semibold">Ask Your Fleet</span>
              <span className="text-xs text-slate-500 ml-auto">Powered by Gemini</span>
            </div>
            <div className="flex-1 overflow-hidden p-3">
              <AskFleetChat fleetContext={fleetContext} />
            </div>
          </div>
        </div>

        {/* Scoreboard + Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scoreboard */}
          <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <span className="text-sm font-semibold">Fleet Efficiency Scoreboard</span>
              <span className="text-xs text-slate-500 ml-auto">ranked by km/L</span>
            </div>
            <div className="p-4">
              <Scoreboard vehicles={transformed?.scores || []} />
            </div>
          </div>

          {/* Alert Panel */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-semibold">Active Alerts</span>
              {transformed?.alerts.length ? (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {transformed.alerts.length}
                </span>
              ) : (
                <span className="ml-auto text-xs text-slate-500">Top 5</span>
              )}
            </div>
            <div className="p-4">
              <AlertPanel alerts={transformed?.alerts || []} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
