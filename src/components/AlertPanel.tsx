"use client";

import React from "react";
import { AlertTriangle, Info } from "lucide-react";

interface Alert {
    id: string;
    vehicleName: string;
    faultCode: string;
    description: string;
    timestamp: string;
    severity: "critical" | "warning" | "info";
}

interface AlertPanelProps {
    alerts: Alert[];
}

const severityConfig = {
    critical: {
        icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
        bg: "bg-red-500/10 border-red-500/30",
        text: "text-red-400",
        label: "CRITICAL",
    },
    warning: {
        icon: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
        bg: "bg-yellow-500/10 border-yellow-500/30",
        text: "text-yellow-400",
        label: "WARNING",
    },
    info: {
        icon: <Info className="w-4 h-4 text-blue-400" />,
        bg: "bg-blue-500/10 border-blue-500/30",
        text: "text-blue-400",
        label: "INFO",
    },
};

export default function AlertPanel({ alerts }: AlertPanelProps) {
    if (alerts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                    <span className="text-2xl">✅</span>
                </div>
                <p>No active alerts — fleet is healthy</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {alerts.slice(0, 5).map((alert) => {
                const cfg = severityConfig[alert.severity];
                return (
                    <div
                        key={alert.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${cfg.bg}`}
                    >
                        <div className="mt-0.5 flex-shrink-0">{cfg.icon}</div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</span>
                                <span className="text-xs text-slate-400">—</span>
                                <span className="text-sm font-semibold text-slate-200 truncate">
                                    {alert.vehicleName}
                                </span>
                            </div>
                            <p className="text-sm text-slate-300">{alert.description}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Code: {alert.faultCode} · {new Date(alert.timestamp).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
