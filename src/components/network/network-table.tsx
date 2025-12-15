/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

'use client'

import type { CSSProperties } from 'react'
import { useEffect, useState, useId } from 'react'
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    type SortingState,
    type Header,
    type Cell
} from '@tanstack/react-table'
import {
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    closestCenter,
    type DragEndEvent
} from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import {
    arrayMove,
    SortableContext,
    useSortable,
    horizontalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

import { columns } from './network-table-columns'
import type { NetworkDetail } from '@/types/network'
import {networkApi} from "@/services/networkApi";

interface NetworkTableProps {
    selectedCountry: string
}

const DraggableTableHeader = ({ header }: { header: Header<NetworkDetail, unknown> }) => {
    const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
        id: header.column.id
    })

    const style: CSSProperties = {
        opacity: isDragging ? 0.8 : 1,
        position: 'relative',
        transform: CSS.Translate.toString(transform),
        transition,
        whiteSpace: 'nowrap',
        width: header.column.getSize(),
        zIndex: isDragging ? 1 : 0
    }

    return (
        <TableHead
            ref={setNodeRef}
            className='before:bg-border relative h-10 border-t before:absolute before:inset-y-0 before:left-0 before:w-px first:before:bg-transparent'
            style={style}
            aria-sort={
                header.column.getIsSorted() === 'asc'
                    ? 'ascending'
                    : header.column.getIsSorted() === 'desc'
                        ? 'descending'
                        : 'none'
            }
        >
            <div className='flex items-center justify-start gap-0.5'>
                <Button
                    size='icon'
                    variant='ghost'
                    className='-ml-2 size-7'
                    {...attributes}
                    {...listeners}
                    aria-label='Drag to reorder'
                >
                    <GripVertical className='opacity-60' aria-hidden='true' />
                </Button>
                <span className='grow truncate'>
          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
        </span>
                {header.column.getCanSort() && (
                    <Button
                        size='icon'
                        variant='ghost'
                        className='group -mr-1 size-7'
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                header.column.getToggleSortingHandler()?.(e)
                            }
                        }}
                        aria-label='Toggle sorting'
                    >
                        {{
                            asc: <ChevronUp className='shrink-0 opacity-60' size={16} aria-hidden='true' />,
                            desc: <ChevronDown className='shrink-0 opacity-60' size={16} aria-hidden='true' />
                        }[header.column.getIsSorted() as string] ?? (
                            <ChevronUp className='shrink-0 opacity-0 group-hover:opacity-60' size={16} aria-hidden='true' />
                        )}
                    </Button>
                )}
            </div>
        </TableHead>
    )
}

const DragAlongCell = ({ cell }: { cell: Cell<NetworkDetail, unknown> }) => {
    const { isDragging, setNodeRef, transform, transition } = useSortable({
        id: cell.column.id
    })

    const style: CSSProperties = {
        opacity: isDragging ? 0.8 : 1,
        position: 'relative',
        transform: CSS.Translate.toString(transform),
        transition,
        width: cell.column.getSize(),
        zIndex: isDragging ? 1 : 0
    }

    return (
        <TableCell ref={setNodeRef} className='truncate' style={style}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
    )
}

export function NetworkTable({ selectedCountry }: NetworkTableProps) {
    const [data, setData] = useState<NetworkDetail[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnOrder, setColumnOrder] = useState<string[]>(columns.map(column => column.id as string))

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
        enableSortingRemoval: false
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
            if (!selectedCountry || selectedCountry === 'world') {
                setData([])
                setLoading(false)
                return
            }

            setLoading(true)
            setError(null)

            try {
                const response = await networkApi.getNetworkDetails({
                    cc: selectedCountry,
                    limit: 20,
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

    if (!selectedCountry || selectedCountry === 'world') {
        return (
            <div className='flex h-[400px] items-center justify-center rounded-md border bg-white'>
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
            <div className='rounded-md border bg-white'>
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
            <div className='rounded-md border bg-white'>
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
                                <TableRow key={headerGroup.id} className='bg-muted/50 [&>th]:border-t-0'>
                                    <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                                        {headerGroup.headers.map(header => (
                                            <DraggableTableHeader key={header.id} header={header} />
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
                                            <SortableContext key={cell.id} items={columnOrder} strategy={horizontalListSortingStrategy}>
                                                <DragAlongCell key={cell.id} cell={cell} />
                                            </SortableContext>
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
                </DndContext>
            </div>
            <p className='text-muted-foreground text-center text-sm'>
                Showing {table.getRowModel().rows.length} autonomous systems
            </p>
        </div>
    )
}
