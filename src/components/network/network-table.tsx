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
import { GripVertical, ChevronUp, AlertCircle } from 'lucide-react'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

import { columns } from './network-table-columns'
import type { NetworkDetail } from '@/types/network'
import {networkApi} from "@/services/networkApi";
import {
    Pagination,
    PaginationContent, PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";
import {
    Select, SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {Country} from "@/types/dashboard";
import {useTimeRangeStore} from "@/lib/stores/time-range-store";

interface NetworkTableProps {
    selectedCountry: Country
}

const COLUMN_TO_API_SORT: Record<string, 'name' | 'cidrs' | 'bgp-anomalies' | 'ping-anomalies'> = {
    name: 'name',
    ipv4_cidrs: 'cidrs',
    anomalies_as: 'bgp-anomalies',
    anomalies_router: 'ping-anomalies'
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
                        <ChevronUp
                            className={`shrink-0 ${header.column.getIsSorted() ? 'opacity-60' : 'opacity-0 group-hover:opacity-60'}`}
                            size={16}
                            aria-hidden='true'
                        />
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

    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalEntries, setTotalEntries] = useState(0)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    const timeRange = useTimeRangeStore(state => state.timeRange)
    const windowSize = useTimeRangeStore(state => state.windowSize)

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

    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = []
        const maxVisible = 5

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i)
                }
                pages.push('ellipsis')
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push('ellipsis')
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                pages.push(1)
                pages.push('ellipsis')
                pages.push(currentPage - 1)
                pages.push(currentPage)
                pages.push(currentPage + 1)
                pages.push('ellipsis')
                pages.push(totalPages)
            }
        }

        return pages
    }

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
                const sortColumn = sorting.length > 0 ? sorting[0].id : 'name'
                const apiSortValue = COLUMN_TO_API_SORT[sortColumn] || 'name'

                const response = await networkApi.getNetworkDetails({
                    cc: selectedCountry.code,
                    limit: itemsPerPage,
                    page: currentPage,
                    sort: apiSortValue,
                    timeRange: timeRange,
                    windowSize: windowSize
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
    }, [selectedCountry, currentPage, itemsPerPage, sorting, timeRange, windowSize])

    if (!selectedCountry || selectedCountry.code === 'world') {
        return (
            <div className='h-full rounded-lg border bg-card p-6 shadow-sm'>
                <h2 className='mb-4 text-xl font-semibold'>Übersicht Autonome Systeme</h2>
                <div className='relative w-full space-y-4'>
                    <div className='rounded-md border bg-white blur-sm pointer-events-none'>
                        <Table>
                            <TableHeader>
                                <TableRow className='bg-muted/50'>
                                    {columns.map(column => (
                                        <TableHead key={column.id} className='h-10'>
                                            <div className='flex items-center gap-2'>
                                                <div className='h-4 w-4 rounded bg-muted' />
                                                <div className='h-4 w-24 bg-muted' />
                                                <div className='ml-auto h-4 w-4 rounded bg-muted' />
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {columns.map((column, colIndex) => (
                                            <TableCell key={column.id}>
                                                {colIndex === 0 ? (
                                                    <div className='h-4 w-16 bg-muted' />
                                                ) : colIndex === 1 ? (
                                                    <div className='h-4 w-32 bg-muted' />
                                                ) : colIndex === 3 || colIndex === 4 ? (
                                                    <div className='h-5 w-20 rounded-full bg-muted' />
                                                ) : colIndex === 7 ? (
                                                    <div className='space-y-1'>
                                                        <div className='h-3 w-28 bg-muted' />
                                                        <div className='h-3 w-16 bg-muted' />
                                                    </div>
                                                ) : (
                                                    <div className='h-4 w-12 mx-auto bg-muted' />
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className='absolute inset-0 flex items-center justify-center'>
                        <div className='rounded-lg bg-white/95 px-4 py-3 shadow-lg border'>
                            <p className='text-foreground text-sm font-medium'>Bitte nach einem Land filtern!</p>
                        </div>
                    </div>
                </div>
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

    return (
        <div className='h-full rounded-lg border bg-card p-6 shadow-sm'>
            <h2 className='mb-4 text-xl font-semibold'>Übersicht Autonome Systeme - {selectedCountry.name}</h2>
            <div className='w-full space-y-4'>
                <div className='rounded-md border bg-white'>
                    {loading ? (
                        <Table>
                            <TableHeader>
                                <TableRow className='bg-muted/50'>
                                    {columns.map(column => (
                                        <TableHead key={column.id} className='h-10'>
                                            <div className='flex items-center gap-2'>
                                                <Skeleton className='h-4 w-4 rounded' />
                                                <Skeleton className='h-4 w-24' />
                                                <Skeleton className='ml-auto h-4 w-4 rounded' />
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: itemsPerPage }).map((_, i) => (
                                    <TableRow key={i}>
                                        {columns.map((column, colIndex) => (
                                            <TableCell key={column.id}>
                                                {colIndex === 0 ? (
                                                    <Skeleton className='h-4 w-16' />
                                                ) : colIndex === 1 ? (
                                                    <Skeleton className='h-4 w-32' />
                                                ) : colIndex === 3 || colIndex === 4 ? (
                                                    <Skeleton className='h-5 w-20 rounded-full' />
                                                ) : colIndex === 7 ? (
                                                    <div className='space-y-1'>
                                                        <Skeleton className='h-3 w-28' />
                                                        <Skeleton className='h-3 w-16' />
                                                    </div>
                                                ) : (
                                                    <Skeleton className='h-4 w-12 mx-auto' />
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
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
                                                No network data available for {selectedCountry.code}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </DndContext>
                    )}
                </div>
                <div className='flex items-center justify-between'>
                    <p className='text-muted-foreground whitespace-nowrap text-sm'>
                        Einträge {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalEntries)} ({totalEntries})
                    </p>

                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>

                            {getPageNumbers().map((page, index) => (
                                <PaginationItem key={index}>
                                    {page === 'ellipsis' ? (
                                        <PaginationEllipsis />
                                    ) : (
                                        <PaginationLink
                                            onClick={() => setCurrentPage(page)}
                                            isActive={currentPage === page}
                                            className='cursor-pointer'
                                        >
                                            {page}
                                        </PaginationLink>
                                    )}
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>

                    <div className='flex items-center gap-2'>
                        <span className='text-muted-foreground whitespace-nowrap text-sm'>Anzahl pro Seite:</span>
                        <Select
                            value={String(itemsPerPage)}
                            onValueChange={(value) => {
                                setItemsPerPage(Number(value))
                                setCurrentPage(1)
                            }}
                        >
                            <SelectTrigger className='h-8 w-[80px]'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='10'>10</SelectItem>
                                <SelectItem value='25'>25</SelectItem>
                                <SelectItem value='50'>50</SelectItem>
                                <SelectItem value='100'>100</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    )
}
