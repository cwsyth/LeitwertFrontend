/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {Skeleton} from '@/components/ui/skeleton'
import type {ColumnDef} from '@tanstack/react-table'
import type {NetworkDetail} from '@/types/network'

interface TableSkeletonProps {
    columns: ColumnDef<NetworkDetail>[]
    itemsPerPage: number
}

export function TableSkeleton({columns, itemsPerPage}: TableSkeletonProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow className='bg-muted/50'>
                    {columns.map(column => (
                        <TableHead key={column.id} className='h-10'>
                            <div className='flex items-center gap-2'>
                                <Skeleton className='h-4 w-4 rounded'/>
                                <Skeleton className='h-4 w-24'/>
                                <Skeleton className='ml-auto h-4 w-4 rounded'/>
                            </div>
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({length: itemsPerPage}).map((_, i) => (
                    <TableRow key={i}>
                        {columns.map((column, colIndex) => (
                            <TableCell key={column.id}>
                                {colIndex === 0 ? (
                                    <Skeleton className='h-4 w-16'/>
                                ) : colIndex === 1 ? (
                                    <Skeleton className='h-4 w-32'/>
                                ) : colIndex === 3 || colIndex === 4 ? (
                                    <Skeleton
                                        className='h-5 w-20 rounded-full'/>
                                ) : colIndex === 7 ? (
                                    <div className='space-y-1'>
                                        <Skeleton className='h-3 w-28'/>
                                        <Skeleton className='h-3 w-16'/>
                                    </div>
                                ) : (
                                    <Skeleton className='h-4 w-12 mx-auto'/>
                                )}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
