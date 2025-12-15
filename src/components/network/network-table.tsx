/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

'use client'

import { useEffect, useState } from 'react'
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    type SortingState
} from '@tanstack/react-table'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

import { columns } from './network-table-columns'
import type { NetworkDetail } from '@/types/network'
import {networkApi} from "@/services/networkApi";

interface NetworkTableProps {
    selectedCountry: string
}

export function NetworkTable({ selectedCountry }: NetworkTableProps) {
    const [data, setData] = useState<NetworkDetail[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sorting, setSorting] = useState<SortingState>([])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting
        },
        enableSortingRemoval: false
    })

    useEffect(() => {
        async function fetchData() {
            if (!selectedCountry) {
                setData([])
                setLoading(false)
                return
            }

            setLoading(true)
            setError(null)

            try {
                const response = await networkApi.getNetworkDetails({
                    cc: selectedCountry,
                    limit: 100,
                    page: 1,
                    sort: 'name'
                })
                setData(response.details)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load network data')
                setData([])
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [selectedCountry])

    if (!selectedCountry) {
        return (
            <div className='flex h-[400px] items-center justify-center rounded-md border'>
                <p className='text-muted-foreground'>Select a country to view network details</p>
            </div>
        )
    }

    if (error) {
        return (
            <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    if (loading) {
        return (
            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map(column => (
                                <TableHead key={column.id}>
                                    <Skeleton className='h-4 w-full' />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                {columns.map(column => (
                                    <TableCell key={column.id}>
                                        <Skeleton className='h-4 w-full' />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }

    return (
        <div className='w-full space-y-4'>
            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className='h-24 text-center'>
                                    No network data available for {selectedCountry}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <p className='text-muted-foreground text-center text-sm'>
                Showing {table.getRowModel().rows.length} autonomous systems
            </p>
        </div>
    )
}
