/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import type {ColumnDef} from '@tanstack/react-table'
import {Badge} from '@/components/ui/badge'
import type {AllocationStatus, NetworkDetail} from '@/types/network'
import {Router} from "@/types/dashboard";
import {
    ListTooltip
} from "@/components/network-table/components/cells/list-tooltip";
import {
    SingleRouterCell
} from "@/components/network-table/components/cells/single-router-cell";
import {
    MultipleRoutersCell
} from "@/components/network-table/components/cells/multiple-routers-cell";

const allocationStatusConfig: Record<AllocationStatus, {
    variant: 'default' | 'destructive' | 'outline' | 'secondary';
    label: string
}> = {
    allocated: {variant: 'default', label: 'Allocated'},
    assigned: {variant: 'outline', label: 'Assigned'},
    reserved: {variant: 'secondary', label: 'Reserved'},
    available: {variant: 'outline', label: 'Available'}
}

export const createColumns = (
    routers: Router[],
    router: Router | null,
    setSelectedRouter: (router: Router | null) => void,
    selectedAs: number,
    setSelectedAs: (asn: number) => void
): ColumnDef<NetworkDetail>[] => {

    return [
        {
            id: 'name',
            header: 'Name',
            accessorKey: 'name',
            cell: ({row}) => {
                const name = row.getValue('name') as string | undefined
                return <div
                    className='max-w-[200px] truncate'>{name || '-'}</div>
            }
        },
        {
            id: 'asn',
            header: 'ASN',
            accessorKey: 'asn',
            cell: ({row}) => {
                const isSelected = Number(row.original.asn) === selectedAs

                return isSelected ? (
                    <Badge
                        variant='default'
                        className='cursor-pointer bg-black text-white hover:bg-black/90'
                        onClick={() => setSelectedAs(Number(row.original.asn))}
                    >
                        AS{row.getValue('asn')}
                    </Badge>
                ) : (
                    <div
                        className='font-mono font-medium cursor-pointer hover:text-primary'
                        onClick={() => setSelectedAs(Number(row.original.asn))}
                    >
                        AS{row.getValue('asn')}
                    </div>
                )
            },
            sortDescFirst: false,
            enableSorting: false
        },
        {
            id: 'routers',
            header: 'Routers',
            accessorFn: (row) => {
                // Find all routers that match this AS
                return routers.filter(router => router.asn == row.asn)
            },
            cell: ({row}) => {
                const matchedRouters = routers.filter(router => router.asn == row.original.asn)

                if (matchedRouters.length === 0) {
                    return <div className='text-muted-foreground'>-</div>
                }

                if (matchedRouters.length === 1) {
                    return <SingleRouterCell router={matchedRouters[0]}
                                             onRouterClick={setSelectedRouter}
                                             selectedRouter={router}
                    />
                }

                return <MultipleRoutersCell routers={matchedRouters}
                                            onRouterClick={setSelectedRouter}
                                            selectedRouter={router}
                />
            },
            enableSorting: false
        },
        {
            id: 'ipv4_cidrs',
            header: 'IPv4 CIDRs',
            accessorKey: 'ipv4_cidrs',
            cell: ({row}) => {
                const cidrs = row.getValue('ipv4_cidrs') as string[]
                return <ListTooltip items={cidrs} title="IPv4 CIDR Ranges"/>
            }
        },
        {
            id: 'anomalies_as',
            header: 'Anomalies (AS)',
            accessorFn: (row) => row.anomalies.length,
            cell: ({row}) => {
                const anomalies = row.original.anomalies.length

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
            accessorFn: (row) => 0,
            cell: ({row}) => {
                const anomalies = 0 // TODO: Replace with real data from map request

                return (
                    <div className='text-center'>
                        <span className='font-semibold'>{anomalies}</span>
                    </div>
                )
            }
        },
        {
            id: 'status',
            header: 'Allocation',
            accessorKey: 'status',
            cell: ({row}) => {
                const status = row.getValue('status') as AllocationStatus
                const config = allocationStatusConfig[status] || allocationStatusConfig.allocated
                return <Badge variant={config.variant}>{config.label}</Badge>
            },
            enableSorting: false
        },
        {
            id: 'registry',
            header: 'Registry',
            accessorKey: 'registry',
            cell: ({row}) => {
                const registry = row.getValue('registry') as string
                return <div className='uppercase'>{registry}</div>
            },
            enableSorting: false
        }
    ]
}
