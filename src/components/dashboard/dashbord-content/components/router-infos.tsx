/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import React from 'react';
import {
    Activity,
    Globe,
    Network,
    Server,
    Clock,
    AlertCircle,
    CheckCircle,
    AlertTriangle,
    Loader2, CircleDashed
} from 'lucide-react';
import { useRouterData } from "@/hooks/useRouterData";

interface StatusConfig {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
    label: string;
}

const getStatusConfig = (status: string): StatusConfig => {
    const configs: Record<string, StatusConfig> = {
        critical: {
            icon: AlertCircle,
            color: 'text-red-500',
            bg: 'bg-red-50',
            label: 'Critical'
        },
        warning: {
            icon: AlertTriangle,
            color: 'text-yellow-500',
            bg: 'bg-yellow-50',
            label: 'Warning'
        },
        healthy: {
            icon: CheckCircle,
            color: 'text-green-500',
            bg: 'bg-green-50',
            label: 'Healthy'
        },
        unknown: {
            icon: CircleDashed,
            color: 'text-gray-500',
            bg: 'bg-gray-50',
            label: 'Unknown'
        }
    };
    return configs[status] || configs['unknown'];
};

const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default function RouterInfos({ routerId }: { routerId: string }) {
    const { data, isLoading, isError, error } = useRouterData(routerId);

    if (isLoading) {
        return (
            <div className="w-80 p-8 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-sm text-gray-500">Lade...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="w-80 p-4">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-800">Fehler beim Laden</p>
                        <p className="text-xs text-red-600 mt-1">{error?.message || 'Unbekannter Fehler'}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const statusConfig = getStatusConfig(data.status);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="w-80 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{data.name}</h3>
                    <p className="text-xs text-gray-500 font-mono">Tier {data.tier}</p>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusConfig.bg} flex-shrink-0`}>
                    <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                    <span className={`text-xs font-medium ${statusConfig.color} whitespace-nowrap`}>
                        {statusConfig.label}
                    </span>
                </div>
            </div>

            {/* Latency */}
            <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                <Activity className="w-4 h-4 text-gray-600 flex-shrink-0" />
                <div className="flex-1">
                    <p className="text-xs text-gray-500">Latenz</p>
                    <p className="text-sm font-semibold">{data.latency}ms</p>
                </div>
            </div>

            {/* Network Info */}
            <div className="space-y-2">
                <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">IP Adresse</p>
                        <p className="text-sm font-mono break-all">{data.ipv4}</p>
                    </div>
                </div>

                <div className="flex items-start gap-2">
                    <Server className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">PTR Record</p>
                        <p className="text-xs font-mono text-gray-700 break-all">{data.ptr}</p>
                    </div>
                </div>
            </div>

            {/* ASN Info */}
            <div className="border-t pt-3">
                <div className="flex items-start gap-2">
                    <Network className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">ASN {data.asn.id}</p>
                        <p className="text-sm font-medium">{data.asn.name}</p>
                        <p className="text-xs text-gray-600">{data.asn.organization}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            <span className="inline-block w-5 h-3.5 mr-1 align-middle bg-gray-200 rounded text-center text-[10px] leading-[14px]">
                                {data.asn.country_code}
                            </span>
                            {data.asn.country_code}
                        </p>
                    </div>
                </div>
            </div>

            {/* CIDR Ranges */}
            <div className="border-t pt-3">
                <p className="text-xs text-gray-500 mb-2">IPv4 CIDR Ranges</p>
                <div className="flex flex-wrap gap-1.5">
                    {data.ipv4_cidrs.map((cidr, index) => (
                        <span
                            key={index}
                            className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-mono rounded"
                        >
                            {cidr}
                        </span>
                    ))}
                </div>
            </div>

            {/* Timestamp */}
            <div className="border-t pt-3 flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Letztes Update: {formatTimestamp(data.timestamp)}</span>
            </div>
        </div>
    );
}