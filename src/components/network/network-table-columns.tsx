/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import type { NetworkDetail, NetworkStatus, AllocationStatus } from '@/types/network'

const statusConfig: Record<NetworkStatus, { variant: 'default' | 'destructive' | 'outline' | 'secondary'; label: string }> = {
    critical: { variant: 'destructive', label: 'Critical' },
    warning: { variant: 'outline', label: 'Warning' },
    healthy: { variant: 'default', label: 'Healthy' },
    unknown: { variant: 'secondary', label: 'Unknown' }
}

const allocationStatusConfig: Record<AllocationStatus, { variant: 'default' | 'destructive' | 'outline' | 'secondary'; label: string }> = {
    allocated: { variant: 'default', label: 'Allocated' },
    assigned: { variant: 'outline', label: 'Assigned' },
    reserved: { variant: 'secondary', label: 'Reserved' },
    available: { variant: 'outline', label: 'Available' }
}

export const columns: ColumnDef<NetworkDetail>[] = [
    {
        id: 'asn',
        header: 'ASN',
        accessorKey: 'asn',
        cell: ({ row }) => <div className='font-mono font-medium'>AS{row.getValue('asn')}</div>,
        sortDescFirst: false
    },
    {
        id: 'name',
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }) => {
            const name = row.getValue('name') as string | undefined
            return <div className='max-w-[200px] truncate'>{name || '-'}</div>
        }
    },
    {
        id: 'registry',
        header: 'Registry',
        accessorKey: 'registry',
        cell: ({ row }) => {
            const registry = row.getValue('registry') as string
            return <div className='uppercase'>{registry}</div>
        }
    },
    {
        id: 'status',
        header: 'Health Status',
        accessorKey: 'status',
        cell: ({ row }) => {
            const status = row.getValue('status') as NetworkStatus
            const config = statusConfig[status] || statusConfig.unknown
            return <Badge variant={config.variant}>{config.label}</Badge>
        }
    },
    {
        id: 'status2',
        header: 'Allocation',
        accessorKey: 'status2',
        cell: ({ row }) => {
            const status = row.getValue('status2') as AllocationStatus
            const config = allocationStatusConfig[status] || allocationStatusConfig.allocated
            return <Badge variant={config.variant}>{config.label}</Badge>
        }
    },
    {
        id: 'routers',
        header: 'Routers',
        accessorKey: 'routers',
        cell: ({ row }) => {
            const routers = row.getValue('routers') as number
            return <div className='text-center'>{routers}</div>
        }
    },
    {
        id: 'anomalies',
        header: 'Anomalies',
        accessorKey: 'anomalies',
        cell: ({ row }) => {
            const anomalies = row.getValue('anomalies') as number
            const status = row.original.status

            return (
                <div className='text-center'>
          <span className={status === 'critical' ? 'font-semibold text-destructive' : ''}>
            {anomalies}
          </span>
                </div>
            )
        }
    },
    {
        id: 'ipv4_cidrs',
        header: 'IPv4 CIDRs',
        accessorKey: 'ipv4_cidrs',
        cell: ({ row }) => {
            const cidrs = row.getValue('ipv4_cidrs') as string[]

            if (cidrs.length === 0) {
                return <div className='text-muted-foreground'>-</div>
            }

            return (
                <div className='max-w-[200px]'>
                    <div className='font-mono text-xs'>{cidrs[0]}</div>
                    {cidrs.length > 1 && (
                        <div className='text-muted-foreground text-xs'>+{cidrs.length - 1} more</div>
                    )}
                </div>
            )
        },
        enableSorting: false
    }
]
