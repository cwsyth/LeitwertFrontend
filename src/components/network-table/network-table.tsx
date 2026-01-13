/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

'use client'

import { useEffect, useId, useState } from 'react'
import {
    getCoreRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable
} from '@tanstack/react-table'
import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import {
    arrayMove,
    horizontalListSortingStrategy,
    SortableContext
} from '@dnd-kit/sortable'
import { AlertCircle } from 'lucide-react'

import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import type { NetworkDetail } from '@/types/network'
import { networkApi } from "@/services/networkApi";
import { Country, Router } from "@/types/dashboard";
import { useTimeRangeStore } from "@/lib/stores/time-range-store";
import { useLocationStore } from '@/lib/stores/location-store'
import { createColumns } from "@/components/network-table/network-table-columns";
import {
    TableSkeleton
} from "@/components/network-table/components/table-skeleton";
import {
    TablePreview
} from "@/components/network-table/components/table-preview";
import {
    DraggableTableHeader
} from "@/components/network-table/components/draggable-header";
import {
    DragAlongCell
} from "@/components/network-table/components/draggable-cell";
import {
    TablePagination
} from "@/components/network-table/components/table-pagination";

interface NetworkTableProps {
    selectedCountry: Country
    routers: Router[];
    selectedRouter: Router | null
    setSelectedRouter: (router: Router | null) => void
    selectedAs: number
    setSelectedAs: (asNumber: number) => void
}

const COLUMN_TO_API_SORT: Record<string, 'name' | 'cidrs' | 'bgp-anomalies'> = {
    name: 'name',
    ipv4_cidrs: 'cidrs',
    anomalies_as: 'bgp-anomalies'
}


export function NetworkTable({
    selectedCountry,
    routers,
    selectedRouter,
    setSelectedRouter,
    selectedAs,
    setSelectedAs
}: NetworkTableProps) {
    const [data, setData] = useState<NetworkDetail[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'anomalies_as', desc: true }
    ])

    const columns = createColumns(routers, selectedRouter, setSelectedRouter, selectedAs, setSelectedAs)
    const [columnOrder, setColumnOrder] = useState<string[]>(columns.map(column => column.id as string))

    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalEntries, setTotalEntries] = useState(0)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    const timeRange = useTimeRangeStore(state => state.timeRange)
    const windowSize = useTimeRangeStore(state => state.windowSize)
    const location = useLocationStore(state => state.selectedLocationId)

    const dndContextId = useId()

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        onColumnOrderChange: setColumnOrder,
        state: {
            sorting,
            columnOrder
        },
        sortDescFirst: false
    })

    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    )

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (active && over && active.id !== over.id) {
            setColumnOrder(columnOrder => {
                const oldIndex = columnOrder.indexOf(active.id as string)
                const newIndex = columnOrder.indexOf(over.id as string)
                return arrayMove(columnOrder, oldIndex, newIndex)
            })
        }
    }

    useEffect(() => {
        async function fetchData() {
            if (!selectedCountry || selectedCountry.code === 'world') {
                setData([])
                setLoading(false)
                setTotalPages(1)
                setTotalEntries(0)
                return
            }

            setLoading(true)
            setError(null)

            try {
                const sortColumn = sorting.length > 0 ? sorting[0].id : 'bgp-anomalies'
                const apiSortValue = COLUMN_TO_API_SORT[sortColumn] || 'bgp-anomalies'

                const response = await networkApi.getNetworkDetails({
                    cc: selectedCountry.code,
                    limit: itemsPerPage,
                    page: currentPage,
                    sort: apiSortValue,
                    timeRange: timeRange,
                    windowSize: windowSize,
                    location: location ?? undefined
                })
                setData(response.details)
                setTotalPages(Math.ceil(response.meta.total_entries / itemsPerPage))
                setTotalEntries(response.meta.total_entries)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load network data')
                setData([])
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCountry, currentPage, itemsPerPage, sorting, timeRange, windowSize])

    if (!selectedCountry || selectedCountry.code === 'world') {
        return <TablePreview columns={columns} />
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

    return (
        <div className='h-full rounded-lg border bg-card p-6 shadow-sm flex flex-col overflow-auto'>
            <h2 className='mb-4 text-l font-semibold'>AS Overview - {selectedCountry.name}</h2>
            <div className='flex-1 min-h-0 space-y-4 flex flex-col'>
                <div className='rounded-md border bg-white flex-1 min-h-0 overflow-auto'>
                    {loading ? (
                        <TableSkeleton columns={columns}
                            itemsPerPage={itemsPerPage} />
                    ) : (
                        <DndContext
                            id={dndContextId}
                            collisionDetection={closestCenter}
                            modifiers={[restrictToHorizontalAxis]}
                            onDragEnd={handleDragEnd}
                            sensors={sensors}
                        >
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <TableRow key={headerGroup.id}
                                            className='bg-muted/50 [&>th]:border-t-0'>
                                            <SortableContext items={columnOrder}
                                                strategy={horizontalListSortingStrategy}>
                                                {headerGroup.headers.map(header => (
                                                    <DraggableTableHeader
                                                        key={header.id}
                                                        header={header} />
                                                ))}
                                            </SortableContext>
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map(row => (
                                            <TableRow key={row.id}>
                                                {row.getVisibleCells().map(cell => (
                                                    <SortableContext
                                                        key={cell.id}
                                                        items={columnOrder}
                                                        strategy={horizontalListSortingStrategy}>
                                                        <DragAlongCell
                                                            key={cell.id}
                                                            cell={cell} />
                                                    </SortableContext>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length}
                                                className='h-24 text-center'>
                                                No network data available
                                                for {selectedCountry.code}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </DndContext>
                    )}
                </div>
                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalEntries={totalEntries}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(value) => {
                        setItemsPerPage(value)
                        setCurrentPage(1)
                    }}
                />
            </div>
        </div>
    )
}
