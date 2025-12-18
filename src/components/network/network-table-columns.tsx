/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import type { NetworkDetail, AllocationStatus } from '@/types/network'
import {
    Tooltip, TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";

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
        sortDescFirst: false,
        enableSorting: false
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
        id: 'anomalies_as',
        header: 'Anomalies (AS)',
        accessorKey: 'anomalies.bgp',
        cell: ({ row }) => {
            const anomalies = row.original.anomalies.bgp

            return (
                <div className='text-center'>
                    <span className='font-semibold'>{anomalies}</span>
                </div>
            )
        }
    },
    {
        id: 'anomalies_router',
        header: 'Anomalies (Router)',
        accessorKey: 'anomalies.ping',
        cell: ({ row }) => {
            const anomalies = row.original.anomalies.ping

            return (
                <div className='text-center'>
                    <span className='font-semibold'>{anomalies}</span>
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

            if (cidrs.length === 1) {
                return <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs'>{cidrs[0]}</code>
            }

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className='cursor-pointer'>
                                <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs'>{cidrs[0]}</code>
                                <div className='text-muted-foreground text-xs mt-0.5'>+{cidrs.length - 1} more</div>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent
                            side='left'
                            align='start'
                            className='max-w-xs border border-muted bg-white p-3 text-black shadow-lg'
                        >
                            <div className='flex flex-col'>
                                <p className='mb-2 text-xs font-semibold text-black'>
                                    IPv4 CIDR Ranges ({cidrs.length})
                                </p>
                                <div className='max-h-[200px] space-y-1.5 overflow-y-auto pr-2'>
                                    {cidrs.map((cidr, index) => (
                                        <code
                                            key={index}
                                            className='block cursor-text select-text rounded bg-gray-100 px-2 py-1 font-mono text-xs text-black hover:bg-gray-200'
                                        >
                                            {cidr}
                                        </code>
                                    ))}
                                </div>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        },
        enableSorting: false
    }
]
