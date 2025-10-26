/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import React from 'react';
import { Activity, Globe, Network, Server, Clock, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const mockRouterData = {
    "timestamp": "2025-10-20T14:35:42Z",
    "id": "rid-42835843790269319330715382585",
    "name": "Test Router Name",
    "ipv4": "102.135.13.5",
    "ptr": "rt-f3l2fk209fkp.apple.com",
    "tier": 1,
    "latency": 14,
    "status": "critical",
    "asn": {
        "id": 216183,
        "name": "Apple",
        "organization": "Apple Network, LLC",
        "country_code": "US"
    },
    "ipv4_cidrs": [
        "102.135.13.0/24",
        "62.3.54.0/24",
        "45.146.163.0/24"
    ]
};

const getStatusConfig = (status: string) => {
    const configs = {
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
        }
    };
    // @ts-ignore
    return configs[status];
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
    const data = mockRouterData;
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