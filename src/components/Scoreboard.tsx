"use client";

import React from "react";

interface VehicleScore {
    id: string;
    name: string;
    distanceKm: number;
    fuelL: number;
    fuelEfficiencyKmL: number;
    idleMinutes: number;
    safetyScore: number;
}

interface ScoreboardProps {
    vehicles: VehicleScore[];
}

function getEfficiencyColor(kmL: number) {
    if (kmL >= 12) return "text-emerald-400";
    if (kmL >= 8) return "text-yellow-400";
    return "text-red-400";
}

function getSafetyColor(score: number) {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
}

export default function Scoreboard({ vehicles }: ScoreboardProps) {
    const sorted = [...vehicles].sort((a, b) => b.fuelEfficiencyKmL - a.fuelEfficiencyKmL);

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                        <th className="text-left py-2 pr-3">#</th>
                        <th className="text-left py-2 pr-3">Vehicle</th>
                        <th className="text-right py-2 pr-3">Distance</th>
                        <th className="text-right py-2 pr-3">Fuel</th>
                        <th className="text-right py-2 pr-3">Efficiency</th>
                        <th className="text-right py-2 pr-3">Idle</th>
                        <th className="text-right py-2">Safety</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((v, i) => (
                        <tr
                            key={v.id}
                            className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                        >
                            <td className="py-2 pr-3 text-slate-500">{i + 1}</td>
                            <td className="py-2 pr-3 font-medium text-slate-100">{v.name}</td>
                            <td className="py-2 pr-3 text-right text-slate-300">
                                {v.distanceKm.toFixed(1)} km
                            </td>
                            <td className="py-2 pr-3 text-right text-slate-300">
                                {v.fuelL.toFixed(1)} L
                            </td>
                            <td className={`py-2 pr-3 text-right font-semibold ${getEfficiencyColor(v.fuelEfficiencyKmL)}`}>
                                {v.fuelEfficiencyKmL.toFixed(2)} km/L
                            </td>
                            <td className="py-2 pr-3 text-right text-slate-300">
                                {v.idleMinutes} min
                            </td>
                            <td className={`py-2 text-right font-semibold ${getSafetyColor(v.safetyScore)}`}>
                                {v.safetyScore}
                            </td>
                        </tr>
                    ))}
                    {sorted.length === 0 && (
                        <tr>
                            <td colSpan={7} className="py-6 text-center text-slate-500">
                                No data available — check Geotab credentials in .env.local
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
